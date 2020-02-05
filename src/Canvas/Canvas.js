import React from 'react';

function filledRect(props) {
    const { ctx, x, y, width, height, color } = props;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

let width = 800;
let height = 800;

let nodeWidth = 10;
let nodeHeight = 10;

let prevX = 0;
let prevY = 0;

// let saveButton;
// let clearButton;
// let slider;
// let xoff = 0;

let nodes = [];
let rows = 80;
let columns = 80;

// let padding = 2;
let currentColor = "#000000";
let nodeColor = "#6699A1";
const backgroundColor_1 = "#FFFEFD";
const backgroundColor_2 = "#CCCBCA";    // or bdc3c7

var ToolEnum = {
    PENCIL: 1,
    ERASER: 2,
    BUCKET: 3,
    properties: {
        1: { name: "PENCIL", value: 1, size: 1 },
        2: { name: "ERASER", value: 2, size: 1 },
        3: { name: "BUCKET", value: 3, size: 1 }
    }
};

var currentTool = ToolEnum.PENCIL;

var canvasElementOffsetLeft;
var canvasElementOffsetTop;

function createNode(x, y, nodeWidth, nodeHeight, ctx) {
    var object = new Object();
    object.x = x;
    object.y = y;
    object.nodeWidth = nodeWidth;
    object.nodeHeight = nodeHeight;
    object.ctx = ctx;
    object.color = nodeColor;

    // object.hasPadding = true;
    object.hasBackground = true;

    // let isFinished = false;

    object.setCoords = function (newX, newY) {
        this.x = newX;
        this.y = newY;
    }

    object.show = function () {
        if (this.hasBackground) {
            const row_of_node = this.x / this.nodeWidth;
            const column_of_node = this.y / this.nodeHeight;

            filledRect({
                ctx: this.ctx, x: this.x, y: this.y,
                width: this.nodeWidth, height: this.nodeHeight, color: (row_of_node + column_of_node) % 2 === 0 ? backgroundColor_1 : backgroundColor_2
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
    object.setBackground = function (hasBackground) {
        this.hasBackground = hasBackground;
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
            nodes[i][j].setBackground(true);
        }
    }
}

function paint(x_of_node, y_of_node, color) {
    const column_under = Math.floor(x_of_node / nodeWidth);
    const row_under = Math.floor(y_of_node / nodeHeight);
    nodes[row_under][column_under].setColor(color);
    
    nodes[row_under][column_under].setBackground(currentTool != ToolEnum.PENCIL);
    nodes[row_under][column_under].show();
}

class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        let isMouseDown = false;
    }

    componentDidMount() {
        this.updateCanvas();

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
        ctx.clearRect(0, 0, 800, 800);
        filledRect({
            ctx: ctx, x: 0, y: 0, width: width, height: height, color: "#FFFFFF"
        });
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
            paint(prevX, prevY, currentColor);
        }
    }

    handleMouseUp = (event) => {
        console.log('mouse up');

        this.isMouseDown = false;
    }

    handleMouseMove = (event) => {
        var x = event.pageX - canvasElementOffsetLeft;
        var y = event.pageY - canvasElementOffsetTop;
        var coordinatesTextElement = document.getElementById("coordinatesText");
        coordinatesTextElement.innerHTML = 'x: ' + x + ' y: ' + y;


        if (x > columns * nodeWidth - 1 || x < 1 || y > rows * nodeHeight - 1 || y < 1) {
            this.isMouseDown = false;
        }

        if (this.isMouseDown) {
            const distance_x = x - prevX;
            const distance_y = y - prevY;
            const steps = Math.max(Math.floor(Math.abs(distance_x)), Math.floor(Math.abs(distance_y)));
            if (steps === 0) {
                paint(x, y, currentColor);
            }
            else {
                for (let index = 0; index <= steps; index++) {
                    paint((prevX + distance_x * index / steps), (prevY + distance_y * index / steps), currentColor);
                }
            }
            prevX = x;
            prevY = y;
        }
    }


    clearCanvas() {

        resetNodes();
        showNodes();

    }

    toggleGrid() {
        if (nodes[0][0].hasPadding === true) {
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    nodes[i][j].setPadding(false);
                }
            }
        }
        else {
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    nodes[i][j].setPadding(true);
                }
            }
        }
        showNodes();

    }

    changeTool() {
        var toolSelectorElement = document.getElementById("toolSelector");

        

        if (currentTool === ToolEnum.PENCIL) {
            toolSelectorElement.innerHTML = ToolEnum.properties[ToolEnum.ERASER].name;
            currentTool = ToolEnum.ERASER;
        }
        else {
            toolSelectorElement.innerHTML = ToolEnum.properties[ToolEnum.PENCIL].name;
            currentTool = ToolEnum.PENCIL;
        }
        console.log('tool change to: ' + ToolEnum.properties[currentTool].name);
    }

    render() {
        const clearButtonStyle = {
            width: '270px',
            height: '60px',
            fontSize: '20px'
        };
        const textStyle = {
            fontSize: '14px'
        };

        return (
            <React.Fragment>
                <canvas id='canvas' onMouseUp={this.handleMouseUp} onMouseDown={this.handleMouseDown} onMouseMove={this.handleMouseMove} ref="canvas" width={width} height={height} />
                <button onClick={this.clearCanvas} class="btn btn--stripe" style={clearButtonStyle}>Clear Canvas</button>
                {/* <button onClick={this.toggleGrid} class="btn btn--stripe" style={clearButtonStyle}>Toggle Grid</button> */}
                <button id='toolSelector' onClick={this.changeTool} class="btn btn--stripe" style={clearButtonStyle}>PENCIL</button>
                <text id='coordinatesText' style={textStyle}>x: y:</text>
            </React.Fragment>
        );
    }
}

export default Canvas;