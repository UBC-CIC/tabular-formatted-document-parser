import React, {Component} from 'react';
import { Container, Divider, Grid, Header, Image } from 'semantic-ui-react';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import IconButton from '@material-ui/core/IconButton';
import { Auth } from "aws-amplify";
import "./Navbar.css";



class Navbar extends Component {

    onSignOut = () => {
        Auth.signOut();
        window.location.reload();
    }

    render() {
        const {username} = this.props;
        return(
            <Grid.Row className={"navbar-wrapper"}>
                <Grid.Column>
                    <Grid>
                        <Grid.Row className={"navbar-inner"} columns={2}>
                            <Grid.Column width={4} verticalAlign={"middle"} className={"navbar-column"} >
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
                            <Grid.Column width={4} verticalAlign={"middle"} className={"navbar-column"}>
                                <h3>Welcome, {username}!</h3>
                            </Grid.Column>
                            <Grid.Column width={4}>

                            </Grid.Column>
                            <Grid.Column width={2} verticalAlign={"middle"} className={"navbar-column-button"}>
                                <Grid>
                                    <Grid.Row style={{padding: "0px"}}>
                                        <Grid.Column style={{padding: "0px"}}>
                                            <IconButton
                                                className={"logout-button"}
                                                onClick={this.onSignOut}
                                            >
                                                <ExitToAppIcon className={"logout-button-icon"}/>
                                            </IconButton>
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row style={{padding: "0px"}}>
                                        <Grid.Column style={{padding: "0px"}}>
                                            <button
                                                className={"logout-text-button"}
                                                onClick={this.onSignOut}>
                                                <span className={"logout-text"}>Logout</span>
                                            </button>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                               {/* <Grid>
                                    <Grid.Row>
                                        <Grid.Column width={4} style={{paddingTop: "7px"}}>
                                            <span className={"logout-text"}>Logout</span>
                                        </Grid.Column>
                                        <Grid.Column width={12}>
                                            <IconButton
                                                className={"logout-button"}
                                                onClick={this.onSignOut}
                                            >
                                                <ExitToAppIcon className={"logout-button-icon"}/>
                                            </IconButton>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>*/}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Grid.Column>
            </Grid.Row>
        )
    }
}

export default Navbar;