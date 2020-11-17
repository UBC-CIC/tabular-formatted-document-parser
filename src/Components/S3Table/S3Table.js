import React, { Component } from "react";
import { connect } from "react-redux";
import { Storage } from "aws-amplify";
import { Table, Grid, Divider } from "semantic-ui-react";
import RefreshIcon from '@material-ui/icons/Refresh';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import GetAppIcon from '@material-ui/icons/GetApp';
import IconButton from '@material-ui/core/IconButton';
import "./S3Table.css";
import {processingFinished} from "../../actions/appStateActions";

class S3Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sort: {
                column: null,
                direction: 'desc'
            },
            files: [],
            numFiles: 0,
            refreshBtnDisabled: false,
            refreshInterval: null,
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

    fetchData = () => {
        const {processingInitiated} = this.props;
        if (processingInitiated) {
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
                console.log("Retrieved CSV files from S3");
                for (var i in result) {
                    const date = (result[i].lastModified).toUTCString();
                    const obj = { name: result[i].key.replace("csv/",""), last_modified: date, size: result[i].size };
                    fileList.push(obj);
                }
                fileList.sort((a,b) => Date.parse(b.last_modified) - Date.parse(a.last_modified));
                const {numFiles} =  that.state;
                const {processingFinished, processingInitiated} = that.props;
                if (fileList.length > numFiles) {
                    processingFinished();
                    this.setState({
                        refreshBtnDisabled: false,
                    })
                }
                this.setState({ files: fileList, numFiles: fileList.length});
                if (!processingInitiated) {
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
            .then(result => console.log(result))
            .catch(err => console.log(err));
        var arr = [...this.state.files];
        console.log(key);
        var index = arr.findIndex(x => x.name === key);
        console.log(`index is ${index}`);
        if (index !== -1) {
            arr.splice(index, 1);
            this.setState({ files: arr, numFiles: arr.length });
        }
    }

    render() {
        const {refreshBtnDisabled} = this.state;
        return (
                <Grid style={{marginRight: "1.66%"}}>
                    <Grid.Row>
                        <Grid.Column>
                            <div className={"file-box"}>
                                <Grid>
                                    <Grid.Row style={{paddingTop: "0px"}}>
                                        <Grid.Column textAlign={"left"} verticalAlign={"middle"}>
                                            <div className={"files-wrapper-top"}>
                                                <span className={"processed-files-header"}><strong>Processed Files</strong></span>
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
                                            <span className={"refresh-btn-message"}>Please click on the refresh button to update the table.</span>
                                        </Grid.Column>
                                        <Grid.Column width={4}>

                                        </Grid.Column>
                                    </Grid.Row>
                                    <Divider />
                                    <Grid.Row>
                                        <Grid.Column textAlign={"center"} verticalAlign={"middle"}>
                                            <div style={{border: "1px solid red", borderRadius: "6px"}}>
                                                <Grid>
                                                    <Grid.Row columns={5} style={{paddingLeft: "0px", marginLeft: "20px", marginRight: "20px", paddingRight: "0px"}}>
                                                        <Grid.Column style={{border: "1px solid yellow"}}>
                                                            Source File
                                                        </Grid.Column>
                                                        <Grid.Column style={{border: "1px solid blue"}}>
                                                            Date
                                                        </Grid.Column>
                                                        <Grid.Column style={{border: "1px solid yellow"}}>
                                                            Size
                                                        </Grid.Column>
                                                        <Grid.Column style={{border: "1px solid blue"}}>
                                                            Download
                                                        </Grid.Column>
                                                        <Grid.Column style={{border: "1px solid yellow"}}>
                                                            Delete
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                </Grid>
                                            </div>
                                            <Table celled compact>
                                                <Table.Header>
                                                    <Table.Row>
                                                        <Table.HeaderCell>Source File</Table.HeaderCell>
                                                        <Table.HeaderCell>Date</Table.HeaderCell>
                                                        <Table.HeaderCell>File Size (Bytes)</Table.HeaderCell>
                                                        <Table.HeaderCell>Download</Table.HeaderCell>
                                                        <Table.HeaderCell>Delete</Table.HeaderCell>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {this.state.files && this.state.files.map(({name, last_modified, size}) => {
                                                        let sourceIndex =  name.lastIndexOf("_")+1;
                                                        let sourceNameWithExt = name.substr(sourceIndex, name.length).toLowerCase();
                                                        let sourceNameWithoutExt = sourceNameWithExt.replace(/\.[^/.]+$/, "");
                                                        let source = sourceNameWithoutExt.replace("-", ".");
                                                        return (
                                                            <Table.Row key={name}>
                                                                <Table.Cell>{source}</Table.Cell>
                                                                <Table.Cell>{last_modified}</Table.Cell>
                                                                <Table.Cell>{size}</Table.Cell>
                                                                <Table.Cell>
                                                                    <Grid>
                                                                        <Grid.Row columns={1}>
                                                                            <Grid.Column textAlign={"center"} verticalAlign={"middle"}>
                                                                                <IconButton
                                                                                    onClick={() => this.downloadData(name)}
                                                                                >
                                                                                    <GetAppIcon style={{color: "lightgreen"}} />
                                                                                </IconButton>
                                                                            </Grid.Column>
                                                                        </Grid.Row>
                                                                    </Grid>
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    <Grid>
                                                                        <Grid.Row columns={1}>
                                                                            <Grid.Column textAlign={"center"} verticalAlign={"middle"}>
                                                                                <IconButton
                                                                                    onClick={() => this.removeData(name)}
                                                                                >
                                                                                    <DeleteForeverIcon style={{color: "red"}} />
                                                                                </IconButton>
                                                                            </Grid.Column>
                                                                        </Grid.Row>
                                                                    </Grid>
                                                                </Table.Cell>
                                                            </Table.Row>
                                                        )
                                                    })}
                                                </Table.Body>
                                            </Table>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        processingFinished: state.appState.processingFinished,
        processingInitiated: state.appState.processingInitiated,
    };
};

const mapDispatchToProps = {
    processingFinished
};

export default connect(mapStateToProps, mapDispatchToProps)(S3Table);