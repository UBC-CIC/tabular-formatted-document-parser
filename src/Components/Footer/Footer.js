import React, {Component} from 'react';
import {Divider, Grid} from "semantic-ui-react";
import "./Footer.css";


class Footer extends Component {


    render() {
        return(
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <Divider/>
                        <Grid>
                            <Grid.Row columns={2}>
                                <Grid.Column>
                                    @2020 UBC CIC
                                </Grid.Column>
                                <Grid.Column>
                                    MIT License
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }

}

export default Footer;