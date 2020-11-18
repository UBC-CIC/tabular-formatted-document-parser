import './App.css';
import { withAuthenticator } from '@aws-amplify/ui-react';
import React, {Component} from 'react';
import { connect } from "react-redux";
import { Grid } from 'semantic-ui-react'
import {Auth} from 'aws-amplify';
import S3Upload from "./Components/S3Upload/S3Upload";
import S3Table from "./Components/S3Table/S3Table";
import Navbar from "./Components/Navbar/Navbar";
import AppNotification from "./Components/Notifications/Notifications";

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
      const {username} = this.state;
      const {notifications} = this.props;
      const notificationList = notifications.map(notification => {
          return (
              <AppNotification key={notification.id} id={notification.id} message={notification.message} type={notification.type} />
          )
      })
    return(
      <div className="App">
          <Grid>
                  <Navbar username={username} />
                 <Grid.Row>
                     <Grid.Column>
                         <br/>
                     </Grid.Column>
                 </Grid.Row>
              <Grid.Row columns={3}>
                  <Grid.Column width={6}>
                      <S3Upload />
                  </Grid.Column>
                  <Grid.Column width={1} />
                  <Grid.Column width={9}>
                      <S3Table />
                  </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                  <Grid.Column verticalAlign={"middle"} textAlign={"center"}>
                      {notificationList}
                  </Grid.Column>
              </Grid.Row>
          </Grid>
          <br/>
          <br/>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
    return {
        notifications: state.notifications.alerts,
    };
};

export default withAuthenticator(connect(mapStateToProps, null)(App));
