import logo from './logo.svg';
import './App.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import React, {Component} from 'react';
import {Auth, Storage} from 'aws-amplify';
import S3Upload from "./Components/S3Upload";
import TableComponent from "./Components/TableComponent";

class App extends Component {
  constructor(props){
    super(props);
    this.state = {username: ""};

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  async componentDidMount() {
    try{
      const user = await Auth.currentAuthenticatedUser();
      this.setState({username: user.username});
    } catch (err) {
      console.log("ERROR : ", err);
    }
  }
  
  render() {
    return(
      <div className="App">
        <AmplifySignOut />
        <S3Upload />
        <br/>
        <TableComponent />
      </div>
    )
  }
}
export default withAuthenticator(App);
