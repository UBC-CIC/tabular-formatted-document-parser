import React, { Component } from "react";
import { Storage } from "aws-amplify";
import { Table, Grid, Divider } from "semantic-ui-react";
import RefreshIcon from '@material-ui/icons/Refresh';
import IconButton from '@material-ui/core/IconButton';
import "./S3Table.css";

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
    }

    async onGetData() {
        var fileList = [];
        this.setState({
            refreshBtnDisabled: true,
        })
        Storage.list('csv/', { level: 'protected' })
            .then(result => {
                console.log("Retrieved CSV files from S3");
                for (var i in result) {
                    const date = (result[i].lastModified).toUTCString();
                    const obj = { name: result[i].key.replace("csv/",""), last_modified: date, size: result[i].size };
                    fileList.push(obj);
                }
                fileList.sort((a,b) => Date.parse(b.last_modified) - Date.parse(a.last_modified));
                this.setState({ files: fileList });
                this.setState({
                    refreshBtnDisabled: false,
                })
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
            this.setState({ files: arr });
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
                                                        style={{color: "#293b75", width: "30px", height: "30px", marginLeft: "20px"}}
                                                        onClick={this.onGetData}>
                                                        <RefreshIcon style={{fontSize: "30px"}} />
                                                    </IconButton>
                                                </div>
                                            }
                                        </Grid.Column>
                                        <Grid.Column width={9} textAlign={"left"} verticalAlign={"middle"}>
                                            <span className={"refresh-btn-message"}>Please click on the refresh button to update the status.</span>
                                        </Grid.Column>
                                        <Grid.Column width={4}>

                                        </Grid.Column>
                                    </Grid.Row>
                                    <Divider />
                                    <Grid.Row>
                                        <Grid.Column textAlign={"left"} verticalAlign={"middle"}>
                                            <Table celled compact>
                                                <Table.Header>
                                                    <Table.Row>
                                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                                        <Table.HeaderCell>Date Modified</Table.HeaderCell>
                                                        <Table.HeaderCell>File Size (Bytes)</Table.HeaderCell>
                                                        <Table.HeaderCell>Download File</Table.HeaderCell>
                                                        <Table.HeaderCell>Delete File</Table.HeaderCell>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {this.state.files && this.state.files.map(({name, last_modified, size}) => {
                                                        return (
                                                            <Table.Row key={name}>
                                                                <Table.Cell>{name}</Table.Cell>
                                                                <Table.Cell>{last_modified}</Table.Cell>
                                                                <Table.Cell>{size}</Table.Cell>
                                                                <Table.Cell>
                                                                    <button className="positive ui button"
                                                                            onClick={() => this.downloadData(name)}>Download
                                                                    </button>
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    <button className="negative ui button"
                                                                            onClick={() => this.removeData(name)}>Delete
                                                                    </button>
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

export default S3Table; 