import React from 'react';

import styles from '../CSS/Button.module.css';

// function outlinedRect(props) {
//     const { ctx, x, y, width, height } = props;
//     ctx.rect(x, y, width, height);
//     ctx.stroke();
// }

function filledRect(props) {
    const { ctx, x, y, width, height, color } = props;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function filledCircle(props) {
    const { ctx, x, y, radius, color } = props;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}


let width = 800;
let height = 800;

let nodeWidth = 20;
let nodeHeight = 20;

let prevX = 0;
let prevY = 0;

let symmetry = 6;
let angle = 360 / symmetry;
// let saveButton;
// let clearButton;
// let slider;
// let xoff = 0;

let nodes = [];
let rows = 40;
let columns = 30;

let padding = 1;
let currentColor = "#A96360";
let nodeColor = "#6699A1";

var canvasElementOffsetLeft;
var canvasElementOffsetTop;

function randomSquareDistribution() {

    let u = Math.random() * 2 - 1.0;

    if (u >= 0)
        return u * u;
    else
        return - u * u;
}

function createNode(x, y, nodeWidth, nodeHeight, ctx) {
    var object = new Object();
    object.x = x;
    object.y = y;
    object.nodeWidth = nodeWidth;
    object.nodeHeight = nodeHeight;
    object.ctx = ctx;
    object.color = nodeColor;

    object.hasPadding = true;

    // let isFinished = false;

    object.setCoords = function (newX, newY) {
        this.x = newX;
        this.y = newY;
    }

    object.show = function () {
        if (this.hasPadding) {
            filledRect({
                ctx: this.ctx, x: this.x + padding / 2, y: this.y + padding / 2,
                width: this.nodeWidth - padding, height: this.nodeHeight - padding, color: this.color
            });
        }
        else {
            filledRect({
                ctx: this.ctx, x: this.x, y: this.y,
                width: this.nodeWidth, height: this.nodeHeight, color: this.color
            });
        }
    }

    object.setColor = function (newColor) {
        this.color = newColor;
    }

    object.setPadding = function (hasPadding) {
        this.hasPadding = hasPadding;
    }

    return object;
}

function initNodes() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < rows; i++) {
        var row_nodes = [];
        for (let j = 0; j < columns; j++) {
            var node = createNode(j * nodeWidth, i * nodeHeight, nodeWidth, nodeHeight, ctx);
            row_nodes.push(node);
        }
        nodes.push(row_nodes);
    }
}

function showNodes() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    filledRect({
        ctx: ctx, x: 0, y: 0, width: width, height: height, color: "#FFFFFF"
    });

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            nodes[i][j].show();
        }
    }
}

function resetNodes() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            nodes[i][j].setColor(nodeColor);
        }
    }
}

class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        let isMouseDown = false;
    }

    componentDidMount() {
        this.updateCanvas();
        // this.drawCoordinateLine();
        initNodes();
        showNodes();

        var canvasElement = document.getElementById("canvas");
        canvasElementOffsetLeft = canvasElement.offsetLeft;
        canvasElementOffsetTop = canvasElement.offsetTop;
    }
    componentDidUpdate() {
        this.updateCanvas();

    }
    updateCanvas() {
        const ctx = this.refs.canvas.getContext('2d');
        // ctx.translate(width / 2, height / 2);
        ctx.clearRect(0, 0, 800, 800);
        filledRect({
            ctx: ctx, x: 0, y: 0, width: width, height: height, color: "#FFFFFF"
        });

        // for (let i = 0; i < 20; i++) {
        //     for (let j = 0; j < 20; j++) {
        //         var node = createNode(j * 10, i * 10, 10, 10, ctx);
        //         node.show();
        //     }
        // }
    }



    handleMouseDown = (event) => {
        console.log('mouse down');

        // if window is resized
        var canvasElement = document.getElementById("canvas");
        canvasElementOffsetLeft = canvasElement.offsetLeft;
        canvasElementOffsetTop = canvasElement.offsetTop;

        prevX = event.pageX - canvasElementOffsetLeft;
        prevY = event.pageY - canvasElementOffsetTop;


        if (prevX > columns * nodeWidth - 1 || prevX < 1 || prevY > rows * nodeHeight - 1 || prevY < 1) {
            this.isMouseDown = false;
        }
        else {
            this.isMouseDown = true;
        }

        if (this.isMouseDown) {
            const column_under = Math.floor(prevX / nodeWidth);
            const row_under = Math.floor(prevY / nodeHeight);
            nodes[row_under][column_under].setColor(currentColor);
            console.log(row_under + ' ' + column_under);
            showNodes();
        }

    }

    handleMouseUp = (event) => {
        console.log('mouse up');

        this.isMouseDown = false;
    }

    handleMouseMove = (event) => {
        // var x = event.clientX - width / 2;
        // var y = event.clientY - height / 2;

        var x = event.pageX - canvasElementOffsetLeft;
        var y = event.pageY - canvasElementOffsetTop;



        if (x > columns * nodeWidth - 1 || x < 1 || y > rows * nodeHeight - 1 || y < 1) {
            this.isMouseDown = false;
        }

        const ctx = this.refs.canvas.getContext('2d');
        if (this.isMouseDown) {

            const column_under = Math.floor(x / nodeWidth);
            const row_under = Math.floor(y / nodeHeight);
            nodes[row_under][column_under].setColor(currentColor);
            console.log(row_under + ' ' + column_under);
            showNodes();

            prevX = x;
            prevY = y;
        }
    }


    clearCanvas() {

        resetNodes();
        showNodes();

    }

    render() {
        const clearButtonStyle = {
            // border: 0,
            // borderRadius: '5px',
            // backgroundColor: '#FFFFFF',
            width: '270px',
            height: '60px',
            fontSize: '20px'
        };

        return (
            <React.Fragment>
                <canvas id='canvas' onMouseUp={this.handleMouseUp} onMouseDown={this.handleMouseDown} onMouseMove={this.handleMouseMove} ref="canvas" width={width} height={height} />
                <button onClick={this.clearCanvas} class="btn btn--stripe" style={clearButtonStyle}>Clear Canvas</button>
            </React.Fragment>
        );
    }
}

export default Canvas;