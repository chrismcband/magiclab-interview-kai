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

export default class Feed extends React.Component {
  constructor(props) {
    super(props);
    //Initialising some props to be undefined
    // for the sake of documentation
    this.state = {
      tweets: [],
      interval: undefined,
      lastId: undefined,
      pollLock: false
    };
  }

  componentDidMount = () => {
    const interval = setInterval(this.poll, POLL_TIME);
    this.setState({ interval });
    this.poll();
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

  poll = async () => {
    const { pollLock, stopPolling } = this.state;
    if (pollLock) {
      console.warn("Already polling");
      return;
    }
    this.setState({ pollLock: true });
    for (let i = 0; i < MAX_ATTEMPTS_PER_POLL; i++) {
      if (stopPolling) {
        // If the component has had componentWillUnmount or stopPoll called
        // stop any poll loops
        return;
      }
      try {
        await this.fetchTweets();
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

  fetchTweets = async () => {
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
    const [mostRecent] = data;
    this.setState({
      tweets: [...data, ...tweets],
      lastId: mostRecent.id
    });
  };

  render() {
    const { tweets } = this.state;
    return (
      <>
        {tweets && tweets.map(tweet => <Tweet tweet={tweet} key={tweet.id} />)}
      </>
    );
  }
}
