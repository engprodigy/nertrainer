import React, { Component } from 'react';
import logo from './logo.svg';
//import './App.css';
import Dropdown from './components/Dropdown';

/*class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 clsassName="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}*/
class App extends Component {
  constructor(){
  super()
  this.state = {
    location: [
      {
        id: 0,
        title: 'New York',
        selected: false,
        key: 'location'
      },
      {
        id: 1,
        title: 'Dublin',
        selected: false,
        key: 'location'
      },
      {
        id: 2,
        title: 'California',
        selected: false,
        key: 'location'
      },
      {
        id: 3,
        title: 'Istanbul',
        selected: false,
        key: 'location'
      },
      {
        id: 4,
        title: 'Izmir',
        selected: false,
        key: 'location'
      },
      {
        id: 5,
        title: 'Oslo',
        selected: false,
        key: 'location'
      },
      {
        id: 6,
        title: 'Zurich',
        selected: false,
        key: 'location'
      }
    ],
    fruit: [
      {
        id: 0,
        title: 'Apple',
        selected: false,
        key: 'fruit'
      },
      {
        id: 1,
        title: 'Orange',
        selected: false,
        key: 'fruit'
      },
      {
        id: 2,
        title: 'Grape',
        selected: false,
        key: 'fruit'
      },
      {
        id: 3,
        title: 'Pomegranate',
        selected: false,
        key: 'fruit'
      },
      {
        id: 4,
        title: 'Strawberry',
        selected: false,
        key: 'fruit'
      }
    ]
  }
}

toggleSelected = (id, key) => {
  let temp = [...this.state[key]]
  temp[id].selected = !temp[id].selected
  this.setState({
    [key]: temp
  })
}

resetThenSet = (id, stateKey) => {
  let fruits = [...this.state.fruit]
  fruits.forEach(item => item.selected = false);
  fruits[id].selected = true;
}

render() {
  return (
    <div className="App">
      <p>Dropdown menu examples</p>

      <div className="wrapper">
        

        <Dropdown
            title="Select fruit"
            list={this.state.fruit}
            resetThenSet={this.resetThenSet}
          />
      </div>
    </div>
  );
}
}

//export default App;

export default App;
