import React from "react";
import Tweet from "../tweet";
import axios from "axios";
import delay from "delay";

const INITIAL_BATCH_SIZE = 1;
const BATCH_SIZE = 50;
const POLL_TIME = 2000; //Two seconds
const TIME_BETWEEN_ATTEMPTS = 100; //0.1 seconds
const MAX_ATTEMPTS_PER_POLL = 4;
const POLL_URL =
  "https://magiclab-twitter-interview.herokuapp.com/candidate-name/api";

const STYLE = {
  height: "100vh",
  overflowY: "auto"
};

export default class Feed extends React.Component {
  constructor(props) {
    super(props);
    //Initialising some props to be undefined
    // for the sake of documentation
    this.feedRef = React.createRef();
    this.state = {
      tweets: [],
      interval: undefined,
      lastId: undefined,
      pollLock: false
    };
  }

  componentDidMount = () => {
    this.startPoll();
  };

  componentWillUnmount = () => {
    this.stopPoll();
  };

  stopPoll = () => {
    const { interval } = this.state;
    if (interval) {
      clearInterval(interval);
      this.setState({ interval: undefined });
    }
    this.setState({ stopPolling: true });
  };

  startPoll = () => {
    const interval = setInterval(this.poll, POLL_TIME);
    this.setState({ interval, stopPolling: false });
    this.poll();
  };

  poll = async (direction = "recent") => {
    const { pollLock, stopPolling } = this.state;
    if (pollLock) {
      console.warn("Already polling");
      return;
    }
    this.setState({ pollLock: true });
    for (let i = 0; i < MAX_ATTEMPTS_PER_POLL; i++) {
      if (stopPolling && direction === "recent") {
        return this.setState({
          pollLock: false
        });
      }
      try {
        if (direction === "recent") {
          await this.fetchLatestTweets();
        } else {
          await this.fetchPastTweets();
        }
        return this.setState({
          pollLock: false
        });
      } catch (e) {
        // In production I would not dream of doing a
        // try-catch-swallow!
        console.error(e);
        await delay(TIME_BETWEEN_ATTEMPTS);
      }
    }
    console.warn("Max attempts reached");
    return this.setState({
      pollLock: false
    });
  };

  fetchLatestTweets = async () => {
    const { tweets, lastId } = this.state;
    const params =
      lastId === undefined
        ? {
            count: INITIAL_BATCH_SIZE
          }
        : {
            count: BATCH_SIZE,
            afterId: lastId
          };
    const { data } = await axios.get(POLL_URL, { params });
    if (data.length === 0) {
      return;
    }

    const newTweets = [...data, ...tweets];
    const [mostRecent] = newTweets;
    const oldest = newTweets[newTweets.length - 1];
    this.setState({
      tweets: newTweets,
      lastId: mostRecent.id,
      firstId: oldest.id
    });
  };

  fetchPastTweets = async () => {
    const { tweets, firstId } = this.state;
    const params =
      firstId === undefined
        ? {
            count: INITIAL_BATCH_SIZE
          }
        : {
            count: BATCH_SIZE,
            beforeId: firstId
          };
    const { data } = await axios.get(POLL_URL, { params });
    if (data.length === 0) {
      return;
    }

    const newTweets = [...tweets, ...data];
    const [mostRecent] = newTweets;
    const oldest = newTweets[newTweets.length - 1];
    this.setState({
      tweets: newTweets,
      lastId: mostRecent.id,
      firstId: oldest.id
    });
  };

  onScroll = () => {
    const feedElement = this.feedRef.current;
    const deltaY = feedElement.scrollTop;
    const { interval } = this.state;
    const isAtTop = deltaY === 0;
    const isAtBottom =
      feedElement.scrollHeight - feedElement.scrollTop ===
      feedElement.clientHeight;
    if (isAtTop && interval === undefined) {
      this.startPoll();
    } else if (isAtBottom) {
      this.poll("past");
    } else if (deltaY !== 0 && interval !== undefined) {
      this.stopPoll();
    }
  };

  render = () => {
    const { tweets, scrollArgs } = this.state;
    return (
      <div style={STYLE} onScroll={this.onScroll} ref={this.feedRef}>
        <pre>{JSON.stringify(scrollArgs, null, 4)}</pre>
        {tweets && tweets.map(tweet => <Tweet tweet={tweet} key={tweet.id} />)}
      </div>
    );
  };
}
