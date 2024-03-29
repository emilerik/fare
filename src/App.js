import React, { Component } from 'react';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Navigation from './components/Navigation/Navigation.js';
//import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';
import Particles from 'react-particles-js';
import './App.css';

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
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = newUser => {
    this.setState({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        entries: newUser.entries,
        joined: newUser.joined
      }
    });
  };

  // Potential improvement: Find all the faces in an image
  calculateFaceLocation = data => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height
    };
  };

  displayFaceBox = box => {
    this.setState({ box: box });
  };

  onInputChange = event => {
    this.setState({ input: event.target.value });
  };

  onImageSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    fetch('https://pacific-retreat-28538.herokuapp.com/imageurl', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response.outputs[0].data.regions) {
          //Checks if face any face was detected
          fetch('https://pacific-retreat-28538.herokuapp.com/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            })
            .catch(console.log);
          this.displayFaceBox(this.calculateFaceLocation(response));
        } else {
          this.setState({ box: {} });
        }
      })
      .catch(err => console.log(err));
  };

  onRouteChange = route => {
    this.setState({ route: route });
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
  };

  render() {
    const { route, isSignedIn, box, imageUrl, user } = this.state;
    const { onRouteChange, onInputChange, onImageSubmit, loadUser } = this;
    return (
      <div className='App'>
        <Particles className='particles' params={particlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
        {route === 'home' ? (
          <div>
            {/* <Logo /> */}
            <Rank name={user.name} entries={user.entries} />
            <ImageLinkForm
              onInputChange={onInputChange}
              onImageSubmit={onImageSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : route === 'signin' ? (
          <Signin loadUser={loadUser} onRouteChange={onRouteChange} />
        ) : (
          <Register loadUser={loadUser} onRouteChange={onRouteChange} />
        )}
      </div>
    );
  }
}
export default App;
