import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Register from './components/Register/Register';
import SignIn from './components/SignIn/SignIn';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import { Component } from 'react';



const particlesValues = {
  "particles": {
    "number": {
        "value": 160,
        "density": {
            "enable": false
        }
    },
    "size": {
        "value": 3,
        "random": true,
        "anim": {
            "speed": 4,
            "size_min": 0.3
        }
    },
    "line_linked": {
        "enable": false
    },
    "move": {
        "random": true,
        "speed": 1,
        "direction": "top",
        "out_mode": "out"
    }
},
"interactivity": {
    "events": {
        "onhover": {
            "enable": true,
            "mode": "bubble"
        },
        "onclick": {
            "enable": true,
            "mode": "repulse"
        }
    },
    "modes": {
        "bubble": {
            "distance": 250,
            "duration": 2,
            "size": 0,
            "opacity": 0
        },
        "repulse": {
            "distance": 400,
            "duration": 4
        }
    }
}
};

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signIn',
    isSignedIn: false,
    user:{
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
    }
}

class App extends Component {
    constructor(){
        super();
        this.state = initialState;

    }

    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        console.log(clarifaiFace);
        const image = document.getElementById('inputImage');
        const width = Number(image.width);
        const height = Number(image.height);
        console.log(width,height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height),
        }
    }

    displayBox = (box) => {
        this.setState ({box: box});
    }


    onInputChange = (event) => {
        this.setState({input: event.target.value})
    }

    onButtonChange = () => {
        this.setState({imageUrl: this.state.input})
            fetch('https://obscure-retreat-54028.herokuapp.com/imageUrl', {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    input: this.state.input
                })
            })
            .then(response => response.json())
            .then(response => {
                if(response) {
                    fetch('https://obscure-retreat-54028.herokuapp.com/image', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        id: this.state.user.id,
                    })
                })
                .then(response => response.json())
                .then(count => {
                    this.setState(Object.assign(this.state.user, {entries: count}))
                }).catch(console.log)
        }
            this.displayBox(this.calculateFaceLocation(response))})
            .catch(err => console.log(err)
        );
    }

    onRouteChange = (route) => {
        if (route === 'signout') {
            this.setState(initialState)
        } else if  (route === "home") {
            this.setState({isSignedIn:true})
        }
        this.setState({route:route});
    }

    loadUser = (data) => {
        this.setState({user: {
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined
        }})
    }

    render() {
        const {isSignedIn,box,imageUrl, route, user} = this.state;
      return (
        <div className="App">
            <Particles className="particles"  
            params={particlesValues} />    
            <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
            { route === 'home' ?
                <div>
                    <Logo />
                    <Rank name={user.name}  entries={user.entries}/>
                    <ImageLinkForm  onInputChange={this.onInputChange} onButtonChange={this.onButtonChange} />
                    <FaceRecognition imageUrl={imageUrl} box={box} />
                </div>
                :(   
                    route==='signIn'
                    ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                    : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                 )
            }
        </div>
        );  
    }
}

export default App;

