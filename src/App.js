import './App.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import React, {Component} from 'react';
import { Container, Divider, Grid, Header, Image } from 'semantic-ui-react'
import {Auth} from 'aws-amplify';
import S3Upload from "./Components/S3Upload";
import S3Table from "./Components/S3Table";

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
          <Grid>
              <Grid.Row>
                  <Grid.Column width={2} textAlign={"center"} verticalAlign={"middle"}>
                      TextRact
                  </Grid.Column>
                  <Grid.Column width={4}>

                  </Grid.Column>
                  <Grid.Column width={4} textAlign={"center"} verticalAlign={"middle"}>
                      <h3>Welcome, {this.state.username}!</h3>
                  </Grid.Column>
                  <Grid.Column width={4}>

                  </Grid.Column>
                  <Grid.Column width={2}>
                      <AmplifySignOut/>
                  </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                  <Grid.Column>

                  </Grid.Column>
              </Grid.Row>
          </Grid>
        <S3Upload />
        <br/>
        <S3Table />
      </div>
    )
  }
}
export default withAuthenticator(App);
