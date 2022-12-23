import React, { useState, useEffect, Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  }

  constructor(props) {
    super(props);
    this.state = {
      jokes: []
    }

    this.generateNewJokes = this.generateNewJokes.bind(this);
    this.vote = this.vote.bind(this)
  }

  componentDidMount() {
    if (this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
  }

  componentDidUpdate() {
    if (this.state.jokes.length < this.props.numJokesToGet) {
      this.getJokes()
    }
  }

  async getJokes() {
    try {
      let jokes = this.state.jokes;
      let seenJokes = new Set(jokes.map(joke => joke.id))
      let jokeVotes = JSON.parse(window.localStorage.getItem("jokeVotes") || "{}")

      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        })
        let { status, ...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id)
          jokeVotes[joke.id] = jokeVotes[joke.id] || 0
          jokes.push({ ...joke, votes: jokeVotes[joke.id] })
        } else {
          console.log("duplicate found!")
        }
      }

      this.setState({ jokes })
      window.localStorage.setItem("jokeVotes", JSON.stringify(jokeVotes))
    } catch (e) {
      console.log(e)
    }
  }

  generateNewJokes() {
    this.setState(state => ({ jokes: state.jokes }))
  }

  vote(id, delta) {
    let votes = JSON.parse(window.localStorage.getItem("jokeVotes"))
    votes[id] = (votes[id] || 0) + delta
    window.localStorage.setItem("jokeVotes", JSON.stringify(votes))
    this.setState(state => ({
      jokes: state.jokes.map(joke => joke.id === id ? { ...joke, votes: joke.votes + delta } : joke)
    }))
  }

  render() {
    let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes)
    return (
      <div className="JokeList">
        <button className="JokeList-getmore" onClick={this.generateNewJokes}>
          Get New Jokes
        </button>

        {sortedJokes.map(j => (
          <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote} />
        ))}
      </div>
    );
  }
}

export default JokeList;
