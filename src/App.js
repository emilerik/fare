import React, { Component } from "react";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition.js";
import Navigation from "./components/Navigation/Navigation.js";
import Logo from "./components/Logo/Logo.js";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm.js";
import Rank from "./components/Rank/Rank.js";
import Signin from "./components/Signin/Signin.js";
import Register from "./components/Register/Register.js";
import Particles from "react-particles-js";
import Clarifai from "clarifai";
import "./App.css";

const app = new Clarifai.App({
  apiKey: "d69c8ac00f584f2fb793701312d4c5f7"
});

const particlesOptions = {
  particles: {
    number: {
      value: 60,
      density: {
        enable: true,
        value_area: 1000
      }
    }
  }
};

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (newUser) => {
    this.setState({user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        entries: newUser.entries,
        joined: newUser.joined
    }
    })
  }

  // componentDidMount() {
  //   fetch('http://localhost:3000/')
  //     .then(response => response.json())
  //     .then(console.log)
  // }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onInputChange = event => {
    this.setState({input: event.target.value});
  }

  onImageSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL, 
        this.state.input)
      .then(response => {
        if (response) {
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }



  onRouteChange = route => {
    this.setState({route: route})
    route === 'home'
    ? this.setState({isSignedIn: true})
    : this.setState({isSignedIn: false})
  }

  render() {
    const { route, isSignedIn, box, imageUrl } = this.state;
    const { onRouteChange, onInputChange, onImageSubmit, loadUser } = this;
    return (
      <div className="App">
        <Particles className="particles"
        params={particlesOptions} 
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange}/>
        { route === 'home' 
        ? <div>
            <Logo />
            <Rank 
            name={this.state.user.name} 
            entries={this.state.user.entries} />
            <ImageLinkForm
              onInputChange={onInputChange}
              onImageSubmit={onImageSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        : (
          route === 'signin'
          ? <Signin loadUser={loadUser} onRouteChange={onRouteChange} />
          : <Register loadUser={loadUser} onRouteChange={onRouteChange} />
        )
        }
      </div>
    );
  }
}
export default App;
