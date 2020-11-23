import React, { Component } from "react";
import { connect } from "react-redux";
import { Storage } from "aws-amplify";
import { Grid, Divider } from "semantic-ui-react";
import RefreshIcon from '@material-ui/icons/Refresh';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import IconButton from '@material-ui/core/IconButton';
import {enqueueAppNotification} from "../../actions/notificationActions";

import "./S3Table.css";
import {processingFinished, fetchStatus} from "../../actions/appStateActions";
import {withStyles} from "@material-ui/core/styles";
import {Tooltip} from "@material-ui/core";

const TextOnlyTooltip = withStyles({
    tooltip: {
        color: "black",
        backgroundColor: "lightgray",
        opacity: 0.5,
        fontSize: "1em"
    }
})(Tooltip);

class S3Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sort: {
                column: null,
                direction: 'desc'
            },
            files: [],
            refreshBtnDisabled: false,
            refreshInterval: null,
            currentFileKey: null,
        }

        this.componentDidMount = this.componentDidMount.bind(this);
        this.onGetData = this.onGetData.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.removeData = this.removeData.bind(this);
    }

    async componentDidMount() {
        try {
            this.onGetData();
        } catch (err) {
            console.log(err);
        }
        const interval = window.setInterval(this.fetchData, 30000);
        this.setState({
            interval: interval,
        })
    }

    componentWillUnmount() {
        const {interval} = this.state;
        clearInterval(interval);
        this.setState({
            interval: null,
        })
    }

    componentDidUpdate(prevProps) {
        if (this.props.currentFileKey !== prevProps.currentFileKey) {
           this.setState({
               currentFileKey: this.props.currentFileKey,
           })
        }

        if (this.props.isProcessingInitiated !== prevProps.isProcessingInitiated) {
            if (this.props.isProcessingInitiated) {
                this.setState({
                    refreshBtnDisabled: true,
                })
            } else {
                this.setState({
                    refreshBtnDisabled: false,
                })
            }
        }

    }

    fetchData = () => {
        const {isProcessingInitiated, fetchStatus} = this.props;
        const {currentFileKey} = this.state;
        if (isProcessingInitiated) {
            if (currentFileKey) {
                fetchStatus({id: currentFileKey});
            }
            this.onGetData();
        }
    }

    async onGetData() {
        var fileList = [];
        this.setState({
            refreshBtnDisabled: true,
        })
        const that = this;
        Storage.list('csv/', { level: 'protected' })
            .then(result => {
                for (var i in result) {
                    const name = result[i].key.replace("csv/","");
                    let keyWithoutExt = name.replace(".csv", "");
                    let keyExtIndex = keyWithoutExt.lastIndexOf("-");
                    let key = keyWithoutExt.concat(".").concat(keyWithoutExt.substring(keyExtIndex + 1));
                    let strippedName = name.substring(37,);
                    let dotIndex =  strippedName.lastIndexOf(".");
                    let sourceNameWithExt = strippedName.substr(0, dotIndex);
                    let sourceExtIndex = sourceNameWithExt.lastIndexOf("-");
                    let firstSegment = sourceNameWithExt.substr(0, sourceExtIndex);
                    let lastSegment = sourceNameWithExt.substr(sourceExtIndex + 1);
                    let source = firstSegment + "." + lastSegment;
                    const date = (result[i].lastModified).toUTCString();
                    const obj = { name: name, source: source, key: key, last_modified: date, size: result[i].size };
                    fileList.push(obj);
                }
                fileList.sort((a,b) => Date.parse(b.last_modified) - Date.parse(a.last_modified));
                const {currentFileKey} =  that.state;
                const {processingFinished, isProcessingInitiated, enqueueAppNotification} = that.props;
                if (fileList.some(file => file.key === currentFileKey)) {
                    this.setState({
                        refreshBtnDisabled: false,
                    })
                    if (isProcessingInitiated) {
                        enqueueAppNotification({type: "success", message: "File processing completed!"});
                    }
                    processingFinished();
                }
                this.setState({ files: fileList });
                if (!isProcessingInitiated) {
                    this.setState({
                        refreshBtnDisabled: false,
                    })
                }
            })
            .catch(err => console.log(err));
    }


    async downloadData(key) {
        function downloadBlob(blob, filename) {
            // https://docs.amplify.aws/lib/storage/download/q/platform/js#file-download-option
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'download';
            const clickHandler = () => {
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    a.removeEventListener('click', clickHandler);
                }, 150);
            };
            a.addEventListener('click', clickHandler, false);
            a.click();
            return a;
        }

        return Storage.get("csv/"+key, { download: true, level: "protected" })
            .then(res => downloadBlob(res.Body, key)) // derive downloadFileName from fileKey if you wish
            .catch(err => {
                console.log(err);
                alert("File not ready yet!")
            });
    }

    async removeData(key) {
        Storage.remove("csv/"+key, { level: 'protected' })
            .then()
            .catch(err => console.log(err));
        var arr = [...this.state.files];
        var index = arr.findIndex(x => x.name === key);
        if (index !== -1) {
            arr.splice(index, 1);
            this.setState({ files: arr });
        }
    }

    render() {
        const {refreshBtnDisabled} = this.state;
        const {isProcessingInitiated} = this.props;
        return (
                <Grid style={{marginRight: "1.66%"}}>
                    <Grid.Row>
                        <Grid.Column>
                            <div className={"file-box"}>
                                <Grid>
                                    <Grid.Row style={{paddingTop: "0px"}}>
                                        <Grid.Column textAlign={"left"} verticalAlign={"middle"}>
                                            <div className={"files-wrapper-top"}>
                                                <span className={"processed-files-header"}>Processed Files (CSV)</span>
                                            </div>
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row columns={3} style={{paddingBottom: "0px"}}>
                                        <Grid.Column width={2} textAlign={"left"} verticalAlign={"middle"}>
                                            {(refreshBtnDisabled)?
                                                <div><button
                                                    className={"ui button loading"}
                                                    style={{backgroundColor: "transparent", width: "20px", height: "20px"}}
                                                /></div>
                                                :
                                                <div>
                                                    <IconButton
                                                        style={{color: "#194cea", width: "30px", height: "30px", marginLeft: "20px"}}
                                                        onClick={this.onGetData}>
                                                        <RefreshIcon style={{fontSize: "25px"}} />
                                                    </IconButton>
                                                </div>
                                            }
                                        </Grid.Column>
                                        <Grid.Column width={9} textAlign={"left"} verticalAlign={"middle"}>
                                            <span className={"refresh-btn-message"}>{(isProcessingInitiated)? <span>Please wait while your file is processed.</span> : <span>Click on the refresh button to update the table.</span>}</span>
                                        </Grid.Column>
                                        <Grid.Column width={4}>

                                        </Grid.Column>
                                    </Grid.Row>
                                    <Divider />
                                    <Grid.Row>
                                        <Grid.Column textAlign={"center"} verticalAlign={"middle"}>
                                            <div className={"list-header"} >
                                                <Grid>
                                                    <Grid.Row columns={5} style={{paddingTop: "10px", paddingBottom: "10px", paddingLeft: "0px", marginLeft: "20px", marginRight: "20px", paddingRight: "0px"}}>
                                                        <Grid.Column width={4} textAlign={"left"} verticalAlign={"middle"}>
                                                            <span className={"list-header-title"}>Source File</span>
                                                        </Grid.Column>
                                                        <Grid.Column width={5} textAlign={"left"} verticalAlign={"middle"}>
                                                            <span className={"list-header-title"}>Date</span>
                                                        </Grid.Column>
                                                        <Grid.Column width={3} textAlign={"center"} verticalAlign={"middle"}>
                                                            <span className={"list-header-title"}>Size (Bytes)</span>
                                                        </Grid.Column>
                                                        <Grid.Column width={2} textAlign={"center"} verticalAlign={"middle"}>
                                                            <span className={"list-header-title"}>Download</span>
                                                        </Grid.Column>
                                                        <Grid.Column width={2} textAlign={"center"} verticalAlign={"middle"}>
                                                            <TextOnlyTooltip title={"Delete"} aria-setsize="15" placement="top">
                                                                <span className={"list-header-title delete-icon"}><DeleteOutlineIcon /></span>
                                                            </TextOnlyTooltip>
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                </Grid>
                                            </div>
                                            <br/>
                                        </Grid.Column>
                                    </Grid.Row>
                                    </Grid>
                                    <Grid className={"files-list"}>
                                    {this.state.files && this.state.files.map(({name, source, last_modified, size}) => {
                                        let sourceOriginal = source;
                                        if (source.length > 20) {
                                            source = source.substr(0, 7) + "..." + source.substr(source.length - 8);
                                        }
                                        let localTime = new Date(last_modified).toLocaleString();
                                        return(
                                            <Grid.Row key={name} className={"list-item-container"}>
                                                <Grid.Column textAlign={"center"} verticalAlign={"middle"}>
                                                    <div className={"list-item"}>
                                                        <Grid>
                                                            <Grid.Row columns={5} style={{paddingTop: "2px", paddingBottom: "2px", paddingLeft: "0px", marginLeft: "20px", marginRight: "20px", paddingRight: "0px"}}>
                                                                <Grid.Column width={4} textAlign={"left"} verticalAlign={"middle"}>
                                                                    <TextOnlyTooltip title={sourceOriginal} aria-setsize="15" placement="right" >
                                                                    <span className={"list-header-title"}>{source}</span>
                                                                    </TextOnlyTooltip>
                                                                </Grid.Column>
                                                                <Grid.Column width={5} textAlign={"left"} verticalAlign={"middle"}>
                                                                    <span className={"list-header-title"}>{localTime}</span>
                                                                </Grid.Column>
                                                                <Grid.Column width={3} textAlign={"center"} verticalAlign={"middle"}>
                                                                    <span className={"list-header-title"}>{size}</span>
                                                                </Grid.Column>
                                                                <Grid.Column width={2} textAlign={"center"} verticalAlign={"middle"}>
                                                                    <Grid>
                                                                        <Grid.Row columns={1}>
                                                                            <Grid.Column textAlign={"center"} verticalAlign={"middle"}>
                                                                                <IconButton
                                                                                    onClick={() => this.downloadData(name)}
                                                                                >
                                                                                    <GetAppIcon style={{color: "#313a45"}} />
                                                                                </IconButton>
                                                                            </Grid.Column>
                                                                        </Grid.Row>
                                                                    </Grid>
                                                                </Grid.Column>
                                                                <Grid.Column width={2} textAlign={"right"} verticalAlign={"middle"}>
                                                                    <Grid>
                                                                        <Grid.Row columns={1}>
                                                                            <Grid.Column textAlign={"center"} verticalAlign={"middle"}>
                                                                                <TextOnlyTooltip title={"Delete"} aria-setsize="15" placement="bottom">
                                                                                    <IconButton
                                                                                        onClick={() => this.removeData(name)}
                                                                                    >
                                                                                        <DeleteForeverIcon style={{color: "red"}} />
                                                                                    </IconButton>
                                                                                </TextOnlyTooltip>
                                                                            </Grid.Column>
                                                                        </Grid.Row>
                                                                    </Grid>
                                                                </Grid.Column>
                                                            </Grid.Row>
                                                        </Grid>
                                                    </div>
                                                </Grid.Column>
                                            </Grid.Row>
                                        )
                                    })}
                                    </Grid>
                                <br/>
                                <br/>
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isProcessingInitiated: state.appState.processingInitiated,
        notifications: state.notifications.alerts,
        currentFileKey: state.appState.currentFileKey,
        status: state.appState.status,
    };
};

const mapDispatchToProps = {
    processingFinished,
    enqueueAppNotification,
    fetchStatus
};

export default connect(mapStateToProps, mapDispatchToProps)(S3Table);