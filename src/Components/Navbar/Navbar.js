import React, {Component} from 'react';
import { Container, Divider, Grid, Header, Image } from 'semantic-ui-react'
import {AmplifySignOut} from "@aws-amplify/ui-react";
import "./Navbar.css";



class Navbar extends Component {


    render() {
        const {username} = this.props;
        return(
            <Grid.Row className={"navbar-wrapper"}>
                <Grid.Column>
                    <Grid>
                        <Grid.Row className={"navbar-inner"} columns={2}>
                            <Grid.Column width={4} verticalAlign={"middle"} style={{paddingTop: "15px"}}>
                                    <Grid>
                                        <Grid.Row columns={2}>
                                            <Grid.Column textAlign={"middle"} verticalAlign={"middle"}>
                                                <div className={"brand-wrapper"}>
                                                    <span className={"brand-text"}>Text<span className={"brand-text-divider"}>/</span>Ract</span>
                                                </div>
                                            </Grid.Column>
                                            <Grid.Column>
                                                <img src={require('../../assets/images/PB_AWS_logo_RGB_stacked.png').default} className={"aws-image"} alt={"..."}/>
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                            </Grid.Column>
                            <Grid.Column width={2}>

                            </Grid.Column>
                            <Grid.Column width={4} verticalAlign={"middle"} style={{paddingTop: "15px"}}>
                                <h3>Welcome, {username}!</h3>
                            </Grid.Column>
                            <Grid.Column width={3}>

                            </Grid.Column>
                            <Grid.Column width={3} style={{paddingTop: "15px"}}>
                                <Grid>
                                    <Grid.Row>
                                        <Grid.Column></Grid.Column>
                                        <Grid.Column>
                                           <AmplifySignOut/>
                                        </Grid.Column>
                                        <Grid.Column></Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Grid.Column>
            </Grid.Row>
        )
    }
}

export default Navbar;