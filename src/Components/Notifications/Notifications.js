import React from "react";
import {connect} from "react-redux";
import { Alert } from '@material-ui/lab';
import {Snackbar} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from '@material-ui/icons/Close';

import {removeAppNotification} from "../../actions/notificationActions";



class AppNotification extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            notificationOpen: true,
        }
    }

    handleClose = () => {
        this.setState({
            notificationOpen: false,
        });

        const {id, removeAppNotification} = this.props;
        removeAppNotification({id: id});
    }

    render(){
        const {notificationOpen} = this.state;
        const {message, type} = this.props;
        return(
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={notificationOpen}
            >
                <Alert severity={type}
                       style={{width: "400px", height: "55px", fontSize: "20px"}}
                       action={
                           <IconButton
                               aria-label="close"
                               color="inherit"
                               size="small"
                               onClick={this.handleClose}
                           >
                               <CloseIcon fontSize="inherit" />
                           </IconButton>
                       }
                >
                    {message}
                </Alert>
            </Snackbar>
        )
    }
}

const mapDispatchToProps = {
    removeAppNotification,
};

export default connect(null, mapDispatchToProps)(AppNotification);