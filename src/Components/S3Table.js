import React, { Component } from "react";
import { Storage } from "aws-amplify";
import { Table } from "semantic-ui-react";

class S3Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sort: {
                column: null,
                direction: 'desc'
            },
            files: []
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
        document.getElementById("list-data-btn").className = "ui disabled primary loading button";
        Storage.list('csv/', { level: 'protected' })
            .then(result => {
                console.log("Retrieved CSV files from S3");
                for (var i in result) {
                    const date = (result[i].lastModified).toUTCString();
                    const obj = { name: result[i].key, last_modified: date, size: result[i].size };
                    fileList.push(obj);
                }
                fileList.sort((a,b) => Date.parse(b.last_modified) - Date.parse(a.last_modified));
                this.setState({ files: fileList });
                document.getElementById("list-data-btn").className = "ui primary button";
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

        return Storage.get(key, { download: true, level: "protected" })
            .then(res => downloadBlob(res.Body, key)) // derive downloadFileName from fileKey if you wish
            .catch(err => {
                console.log(err);
                alert("File not ready yet!")
            });
    }

    async removeData(key) {
        Storage.remove(key, { level: 'protected' })
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
        return (
            <div className="S3Table">
                <button type="submit" id="list-data-btn" class="ui primary button" onClick={this.onGetData}>List Files</button>
                <Table celled compact >
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Date Modified</Table.HeaderCell>
                            <Table.HeaderCell>File Size</Table.HeaderCell>
                            <Table.HeaderCell>Download File</Table.HeaderCell>
                            <Table.HeaderCell>Delete File</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                        <Table.Body>
                            {this.state.files && this.state.files.map(({ name, last_modified, size }) => {
                                return (
                                    <Table.Row key={name}>
                                        <Table.Cell>{name}</Table.Cell>
                                        <Table.Cell>{last_modified}</Table.Cell>
                                        <Table.Cell>{size}</Table.Cell>
                                        <Table.Cell><button class="positive ui button" onClick={() =>this.downloadData(name)}>Download</button></Table.Cell>
                                        <Table.Cell><button class="negative ui button" onClick= {() =>this.removeData(name)}>Delete</button></Table.Cell>
                                    </Table.Row>
                                )
                            })}
                        </Table.Body>
                </Table>
            </div>
        )
    }
}

export default S3Table; 