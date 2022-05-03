import React, { useState } from "react";
import ReactDOM from "react-dom";
import {createRoot} from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.css";
import reportWebVitals from "./reportWebVitals";
import Button from "@mui/material/Button"
import {Checkbox} from "@mui/material";

// questions to Pasha: is taskEditing() functions made with the best practices?

function Checking(props) {
  return (
    <li
      className={props.cBswitching ? "selected" : ""}
    >
      <Checkbox
        //type={"checkbox"}
        onClick={(event) => {
          event.stopPropagation();
          props.checkboxChanging();
        }}
      />
      {props.item}

      <Button variant={"contained"} color={"success"} size={"small"}
              style={{
                margin: 5
              }}
        onClick={(event) => {
          event.stopPropagation();
          props.taskEditing();
        }}
      >
        Change task
      </Button>
      <Button variant={"contained"} color={"error"} size={"small"}
              onClick={(event) => {
                event.stopPropagation();
                props.completeTask();
              }}
      >
        Delete task
      </Button>
    </li>
  );
}

function SaveToFile(props) {
  console.log("SaveFile activated");
  // let blob = new Blob([props.itemsList.toString()],
  //   { type: "text/plain;charset=utf-8" });
  // const element = document.createElement("a");
  // element.href = URL.createObjectURL(blob);
  // element.download = "myFile.txt";
  // document.body.appendChild(element); // Required for this to work in FireFox
  // element.click();
}

class App extends React.Component {
  state = {
    value: "",
    items: [],
    deleted: [],
    localDate: "",
    month: "",
    localTime: "",
  };
  now() {
    let now = new Date();
    return now.getTime();
  }
  // Functions for work with the local storage
  localStoring(itemList) {
    let stringified = JSON.stringify(itemList);
    localStorage.setItem("tasks", stringified);
  }
  stoReturn() {
    let parsed = JSON.parse(localStorage.getItem("tasks"));
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  }

  // Function for the time actualization
  timeRecording() {
    let now = new Date();
    this.setState({ localDate: now.toLocaleDateString() });
    this.setState({ localTime: now.toLocaleTimeString() });
  }

  componentDidMount() {
    this.state.items = this.stoReturn();
    this.timeRecording();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevState.items !== this.state.items ||
      prevState.items.length !== this.state.length
    ) {
      this.localStoring(this.state.items);

    }

  }
  // Function for export To-Do list as a *.txt file
  saveText() {
    let resultedText;
    let timeStampInfo = `To-Do list for ${this.state.localDate} created ${this.state.localTime}` +
      "\n\n"
    if (this.state.items.length !== 0){
      resultedText =
        timeStampInfo +
        this.state.items
          .map((element) => element.value)
          .toString()
          .replace(/,/g, "\n");}
    else{
      resultedText = timeStampInfo + "There were no tasks to the date"
    }
    console.log(this.state.items.length);
    let blob = new Blob([resultedText], { type: "text/plain;charset=utf-8" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = `ToDo_List_exported_${this.state.localDate}_-_${this.state.localTime}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox

    element.click();
  }
  processInput(){
    if (this.state.value !== "") {
      this.setState((prevState) => {
        return {
          value: "",
          items: [
            ...prevState.items,
            {
              time: this.now(),
              value: prevState.value,
              checked: false,
            },
          ],
        };
      });
    }
  }

  // function get the find the changed element
  // changedArray - data array, where we need to find index of changed element
  // item - one row item generated by the <Checking /> component
  findDeletedItem(prevState, item){
    const changedArray = [...prevState.items]
    const editedElementIndex = changedArray.findIndex((element) => element.time === item.time)
    return [...prevState.items][editedElementIndex]
  }

  render() {
    return (
      <div className={"main_div"}>
        <h4 className={"page_head"}>To-Do list for {this.state.localDate}</h4>
        <h5 className={"page_head"}>Current time is {this.state.localTime}</h5>
        <nav>
          <input
            onKeyPress={(event) =>{
          if (event.key === "Enter"){
            this.processInput();
          }
          }}
            value={this.state.value}
            onChange={(event) => {
              this.setState({ value: event.target.value });
            }}
            placeholder={"Hi!"}
          />
          <Button variant={"contained"} size={"small"}
                  style={{
                    margin: 3,
                    background:"gold",
                    color: "black",
                  }}
            onClick={() => {
              this.processInput();
            }}
          >
            Add task!
          </Button>
          <Button variant={"contained"} size={"small"} color={"success"}
                  style={{
                    margin: 3,
                  }}
            onClick={() => {
              this.setState((prevState) => (prevState.items.length = 0));
            }}
          >
            Clear all
          </Button>
          <Button variant={"contained"} size={"small"} color={"error"}
            onClick={() => {
              this.saveText();
            }}
          >
            Save the task list
          </Button>
        </nav>
        <br />
        <ul>
          {this.state.items.map((item) => (
            <Checking
              key={item.time}
              item={item.value}
              cBswitching={item.checked}
              // Memorizing of the checkbox state to items object
              checkboxChanging={() => {
                this.setState((prevState) => {
                  const changedArray = [...prevState.items];
                  const editedItemIndex = changedArray.findIndex(
                    (element) => element.time === item.time
                  );
                  const editedItem = changedArray[editedItemIndex];
                  editedItem.checked = !editedItem.checked;
                  console.log(editedItem);
                  return { items: changedArray };
                });
              }}
              completeTask={() => {
                // Delete element from the array "items"
                let deletedItem = this.state.items.findIndex(
                  (element) => element.time === item.time
                );
                this.setState(() => this.state.items.splice(deletedItem, 1));
              }}
              taskEditing={() => {
                // Editing of the task content
                let editedItem = this.state.items.findIndex(
                  (element) => element.time === item.time
                );
                let newItemContent = prompt(
                  "A new task",
                  this.state.items[editedItem].value
                );
                this.setState(
                  (prevState) => {
                    const changedArray = this.findDeletedItem(prevState, item).value = newItemContent;
                    console.log(this.findDeletedItem(prevState, item));
                    return { changedArray }

                  }
                );
              }}
            />
          ))}
        </ul>
      </div>
    );
  }
}

// ReactDOM.render   document.getElementById("root")
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
