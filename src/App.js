import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class DataContainer extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    const id= this.props.id;
    return(
      <div>
        <div> Start: {this.props.timings.start[id]} </div>
        <div> End: {this.props.timings.end[id]} </div>
        <div> Start Save: {this.props.timings.start_save[id]} </div>
        <div> End Save: {this.props.timings.end_save[id]}  </div>
        <div> ___________________________________________________ </div>

      </div>
    );
  }
}


class Time extends React.Component{
  constructor(props){
    super(props);
    this.state={time: new Date()};
  }
  componentDidMount(){
    this.timer=setInterval(()=>this.tick(),1000);  
  }
  componentWillunount(){
    this.clearInterval(this.timer);
  }
  tick(){
      this.setState({time:new Date()});
  }
  render(){
    return(
      <div>
        <h3> Its {this.state.time.toLocaleTimeString()} </h3>
      </div>
    );
  }
}



class Button extends React.Component{
  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount(){
    this.props.clickFunction({link:this.props.link, id:this.props.id}); 
  }
  handleClick(e){
    e.preventDefault();
    this.props.clickFunction({link:this.props.link, id:this.props.id});  
  }
  render(){
    return(
      <div>
          <button onClick={this.handleClick}> Button {this.props.id} </button>  
      </div>
    );
  }
}


class Container extends React.Component{
  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.startSave=this.startSave.bind(this);
    this.completeSave=this.completeSave.bind(this);
    this.state={
      start : [0,0,0,0],
      end : [0,0,0,0],
      start_save : [0,0,0,0],
      end_save : [0,0,0,0],
    };
  }

  handleClick(data){
    const link=data.link;
    this.id=data.id;

    const newStart=this.state.start;
    newStart[this.id]=new Date().toLocaleTimeString();
    this.setState({
      start: newStart,
      end: this.state.end,
      start_save : this.state.start_save,
      end_save : this.state.end_save,
    });

    axios.get(link)
      .then(res => {

        const newEnd=this.state.end;
        newEnd[this.id]=new Date().toLocaleTimeString();
        this.setState({
          start: this.state.start,
          end: newEnd,
          start_save : this.state.start_save,
          end_save : this.state.end_save,
        });  

        this.data = res.data;
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

        // Open (or create) the database
        this.open = indexedDB.open("MyDatabase", 1);
        // Create the schema
        this.open.onupgradeneeded = function() {
            var db = this.open.result;
            var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
            var index = store.createIndex("NameIndex", ["name.last", "name.first"]);
        };
        this.open.onsuccess = setTimeout(this.startSave,1000);
      });      
  }
  startSave(){
      const newStart_save=this.state.start_save;
      newStart_save[this.id]=new Date().toLocaleTimeString();
      this.setState({
        start: this.state.start,
        end: this.state.end,
        start_save : newStart_save,
        end_save : this.state.end_save,
      });

           
      var open=this.open;
      const data=this.data;      
      // Start a new transaction
      this.db = this.open.result;
      var tx = this.db.transaction("MyObjectStore", "readwrite");
      var store = tx.objectStore("MyObjectStore");
      var index = store.index("NameIndex");

      // Add some data
      for(var i=0;i<data.length;i++){
        store.put(
          {
            id: data[i].id ,
            postId : data[i].postId ,
            name : data[i].name ,
            email : data[i].email ,
            body : data[i].body 
          }
        );  
      }

    tx.oncomplete = this.completeSave;
  }
  completeSave(){
    

    const newEnd_save=this.state.end_save;
    newEnd_save[this.id]=new Date().toLocaleTimeString();
    this.setState({
      start: this.state.start,
      end: this.state.end,
      start_save : this.state.start_save,
      end_save : newEnd_save,
    }); 
  }
  render(){
    return(
      <div>
        <DataContainer id="1" timings={this.state} />
        <DataContainer id="2" timings={this.state} />
        <DataContainer id="3" timings={this.state} />
        <DataContainer id="4" timings={this.state} />
        <Button id="1" link="https://jsonplaceholder.typicode.com/comments" clickFunction={this.handleClick} />
        <Button id="2" link="https://jsonplaceholder.typicode.com/photos" clickFunction={this.handleClick} />
        <Button id="3" link="https://jsonplaceholder.typicode.com/todos" clickFunction={this.handleClick} />
        <Button id="4" link="https://jsonplaceholder.typicode.com/posts" clickFunction={this.handleClick} />
      </div> 
    );
  }
}

function Header(){
  return(
    <div>
      <h3> Test App </h3>
      <div> ___________________________________________________ </div>
    </div>
  );
}

class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <Container />
        <Time />
      </div>    
    );
  }
}


export default App;
 