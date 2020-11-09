import React, { useState, useEffect } from 'react'
import { Storage } from "aws-amplify";


const TableComponent= () => {
    const [files, getFiles] = useState([])

    useEffect(() => {
        getData()
    }, [])

    const getData = async() => {
        var fileList = [];
        Storage.list('csv/', { level: 'protected' })
            .then(result => {
                for (var csv in result) {
                    console.log(result[csv]);
                    const obj = { name: result[csv].key, last_modified: JSON.stringify(result[csv].lastModified), size: result[csv].size};
                    fileList.push(obj);
                }
                getFiles(fileList);
            })
            .catch(err => console.log(err));
    }

    const downloadData = async(e) => {
        return Storage.get(e, { download: true, level: "protected"})
        .then(res => downloadBlob(res.Body, e)) // derive downloadFileName from fileKey if you wish
        .catch(err => console.log(err));
    }

    const downloadBlob = (blob, filename) => {
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

    const removeData = (key) => {
        Storage.remove(key, {level: 'protected'})
        .then(result => console.log(result))
        .catch(err => console.log(err));
    }

    const renderHeader = () => {
        let headerElement = ['Name', 'Last Modified', "File Size"];

        return headerElement.map((key, index) => {
            return <th key={index}>{key}</th>
        })
    }

    const renderBody = () => {
        return files && files.map(({name, last_modified, size}) => {
            return (
                <tr key={name}>
                    <td>{name}</td>
                    <td>{last_modified}</td>
                    <td>{size}</td>
                    <td><button className='button' onClick={() => downloadData(name)}>Download</button></td>
                    <td><button type="delete" onClick={() => removeData(name)}>Delete</button></td>
                </tr>
            )
        })
    }

    return (
        <div>
            <button type="submit" onClick={getData}>List Files</button>
            <table id='file'>
                <thead>
                    <tr>{renderHeader()}</tr>
                </thead>
                <tbody>
                    {renderBody()}
                </tbody>
            </table>
        </div>
    )
}

export default TableComponent;
