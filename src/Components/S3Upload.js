import React, { Component } from "react";
import {Storage } from "aws-amplify";
import {Tooltip, Button} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import { v4 as uuid } from 'uuid';

const TextOnlyTooltip = withStyles({
    tooltip: {
      color: "black",
      backgroundColor: "transparent",
      fontSize: "1em"
    }
})(Tooltip);

class S3Upload extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fileInput: {},
            confidence: 50
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        var conf = e.target.value;
        this.setState({confidence: conf});
    }

    async handleSubmit(e) {
        const visibility = 'protected';
        const selectedFile = document.getElementById("fileUpload").files;
        console.log(selectedFile);
        if (!selectedFile.length) {
            return alert("Please choose a file to upload first!");
        }
        const file = selectedFile[0];
        const fileName = file.name;
        const keyName = uuid(); 
        console.log(fileName);
        let info;
        const [, , , extension] = /([^.]+)(\.(\w+))?$/.exec(fileName);
        console.log("Extension is ", extension);
        const mimeType = fileName.slice(fileName.indexOf('.')+1);
        const key = `${keyName}${extension && '.'}${extension}`;
        document.getElementById("submit-btn").className = "ui disabled loading button";
        Storage.put(key, file, {
            level: visibility,
        }).then(
            (result) => {
                info = {
                    key: result.key,
                    keyName: keyName, 
                    confidence: parseInt(document.getElementById("confidence").value),
                    pages: document.getElementById("pages").value.split(","),
                    file_type: mimeType
                }
                console.log(info);
                Storage.put(`file_info/${keyName}.json`, JSON.stringify(info), { level: visibility, contentType: 'json' })
            },
            (err) => {
                return alert('Error uploading file: ', err.message);
            }
        ).then(() => {
            console.log("Finished uploading");
            document.getElementById("submit-btn").className = "ui button";   
        });
    }

    render() {
        //const isSubmitEnabled = this.state.file !== undefined;
        return (
            <div className="S3Upload">
                <div className="ui divided list">
                    <label for="fileUpload">Upload File (pdf, png, or jpg format only)</label>
                    <div class="ui input">
                        <input id="fileUpload" type="file" />
                    </div>
                    <label for="pages">Pages (seperated with commas)</label>
                    <div className="ui input">
                        <input id="pages" type="text"/>
                    </div>
                    <label for="confidence">Confidence (0-100): </label>
                    <div className="ui input">
                        <input type="number" id="confidence" min="0" max="100" value={this.state.confidence} label="Confidence (0-100)" onChange={this.handleChange} />
                    </div>
                    <TextOnlyTooltip title="Confidence acts as a filter of the results. The recommended default value is 50." aria-setsize="15px">
                        <Button>?</Button>
                    </TextOnlyTooltip>
                </div>
                <button type="submit" id="submit-btn" class="ui button" onClick={this.handleSubmit}>Add File</button>
            </div>
        );
    }
}

export default S3Upload; 