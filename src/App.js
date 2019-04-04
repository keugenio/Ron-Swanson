import React, { Component } from 'react';
import ReactStars from 'react-stars';
import axios from 'axios';
import swal from 'sweetalert';

import './App.css';


class RedStar extends Component{
  render(){
    return (
      <span 
      style={{
        position:'relative', 
        overFlow:'hidden', 
        cursor:'default', 
        diplay:'block',
        float:'left',
        color:'#FF0000',
        fontSize:40}}>★</span>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props); 
    this.state = { 
      quotes:[],
      data:{},
      currentQuote:'',
      ratingInfo:'',
     };
     this.handleClick = this.handleClick.bind(this);
  }

  _findQuotes(sizeLow, sizeHigh) {
    //setup a temp array that includes quotes of each length. return a random quote in that array
    const quoteArr = [];
    this.state.quotes.forEach(quote => {
      // find quotes with word count including and between the lowest and highest counts that are passed
      if (quote.length>=sizeLow && quote.length<=sizeHigh)
        quoteArr.push(quote.quote)
    });

    return  quoteArr[Math.floor(Math.random()*quoteArr.length)];
  }
  async findRatingInfo(){    
    const url = "https://glacial-gorge-14374.herokuapp.com/find?quote=" + this.state.currentQuote;
    console.log("url:" , url);
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      
      let ratingTotal=0;
      data.results.forEach(quote =>{
        ratingTotal += quote.rating || 0;
      })
    
      let ratingInfo='';
      if (ratingTotal===0)
        ratingInfo = "No one has yet to rate this fabulous Ron Swanson quote. How deplorable.";
      else {
        const percentage = ratingTotal/data.results.length;
        ratingInfo = data.results.length + " users rated this quote with an average rating of " + percentage.toFixed(2);
      }
      console.log("setting ratingInfo:" + ratingInfo);
      
      this.setState({ratingInfo:ratingInfo});
    })
  }
  async handleClick(event){
    this.setState({ratingInfo:''})      
    switch (event.target.value) {
      case 'shorter': // find quotes with 4 words or less
          await this.setState({currentQuote: '"' + this._findQuotes(0,4) + '"'})
          await this.findRatingInfo();
        break;
      case 'medium': // find quotes with 5-12 words
          this.setState({currentQuote: '"' + this._findQuotes(5,12) +'"'})
          await this.findRatingInfo();
        break;
      case 'large': // find quotes 13 words or higher.
        
        // find the highest possible number of words for a quote greater than 13
        // this will be the highest value to search words for in the quotes
        let longestQuote = 13;
        this.state.quotes.forEach((quote) =>{ 
          if (quote.length>longestQuote){
            longestQuote = quote.length;
          }
        });          
        await this.setState({currentQuote: '"' + this._findQuotes(13,longestQuote) + '"'});
        await this.findRatingInfo()
        break; 
      default:
        alert('error')
        break;      
    }
  }
  getPreviousRating(numStars){
    let starArr = [];
    for (let i=0; i<numStars; i++)
      starArr.push(<RedStar key={Math.floor(Math.random() * 100)}/>)
    return ( <div className='mb-3'>{starArr}</div> )
  }
  showRating() {
    // only show if currentQuote set
    let previousRating = null;
    if (this.state.currentQuote){
      previousRating = parseInt(localStorage.getItem(this.state.currentQuote))
    }

    if (this.state.currentQuote) // only return stars if there's a current quote else return editable rating scale
      if (previousRating){
          return this.getPreviousRating(previousRating)
      } else {
          return (
            <ReactStars 
              className="mb-4" 
              count={5} 
              onChange={this.ratingChanged} 
              half={false} 
              size={40} 
              color2 = {'#FFD700'}
              edit = {true}
              />
          )   
      }
  }
  componentDidMount() {
    fetch('https://ron-swanson-quotes.herokuapp.com/v2/quotes/100')
      .then(response => response.json())
      .then(data => {
        data.forEach(quote => {
          var res = quote.split(" ");
          this.state.quotes.push({length:res.length, quote:quote});
        })
      });
      console.log(this.state.quotes);
  }

  ratingChanged = (newRating) => {
    if (!localStorage.getItem(this.state.currentQuote))
      localStorage.setItem(this.state.currentQuote, newRating);

      axios.post(`https://glacial-gorge-14374.herokuapp.com/insert`,  {rating:newRating, quote:this.state.currentQuote} )
      .then(res => {
        const response = res.data;
        if (response === 'success'){
          swal({
            title: "Good job!",
            text: "Your rating has been noted.",
            icon: "success",
            button: "Aww yiss!",
          })
          .then((value) => {
            this.setState({ratingInfo:'You have just added to the collective'});
            console.log("Aww yiss, currentQuote is:" + this.state);
            
            this.findRatingInfo();
            this.forceUpdate();            
          });
        }
        else 
        swal({
          title: "EGADS!",
          text: "Your rating has NOT been saved.",
          icon: "error",
          button: "This sucks!",
        });        
      })

  }
  render() {

    return (
      <div className="App">
        <header className="App-header">
          <div className="border border-1 border-color-light mb-4 col-11 align-self-center justify-content-center">
            <div className="display-4 quoteText mb-4">{this.state.currentQuote || 'Ron Swanson Quotes'}</div>
            <div className="d-flex justify-content-center">
              {this.showRating()}
            </div>
            <div className="col-lg-6 offset-lg-6"><p style={pStyle}>{this.state.ratingInfo}</p></div>
          </div>
          <div className="card">
            <p className="card-title" style={{color:'#000'}}>
            Find Ron Swanson quotes by word length</p>
            <div className="card-body">
              <div className="btn-group">
                <button type="button" onClick={e => this.handleClick(e)} value={'shorter'} className="btn btn-primary white-space-normal">Shorter Quotes <br/>4 words or less </button>
                <button type="button" onClick={e => this.handleClick(e)} value={'medium'} className="btn btn-success">Medium Quotes<br/> 5-12 words</button>
                <button type="button" onClick={e => this.handleClick(e)} value={'large'} className="btn btn-warning">Longer Quotes<br />13+ words</button>
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }
}

var pStyle = {
  fontSize:'.7em',
  fontWeight:'300',
  textAlign:'right'
}
export default App;
