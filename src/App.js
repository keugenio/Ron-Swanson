import React, { Component } from 'react';
import ReactStars from 'react-stars'
import './App.css';


class App extends Component {
  constructor(props) {
    super(props); 
    this.state = { 
      quotes:[],
      data:{},
      currentQuote:''
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

  handleClick(event){  
    console.log(event);
    
    switch (event.target.value) {
      case 'shorter': // find quotes with 4 words or less
          this.setState({currentQuote: this._findQuotes(0,4)})
        break;
      case 'medium': // find quotes with 5-12 words
          this.setState({currentQuote: this._findQuotes(5,12)})
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
        this.setState({currentQuote: this._findQuotes(13,longestQuote)})
        break; 
      default:
        alert('error')
        break;      
    }
  }
  showRating() {
    // only show if currentQuote set
    if (this.state.currentQuote)
      return (
        <ReactStars className="mb-4" count={5} onChange={this.ratingChanged} size={24} color2 = {'#FFD700'} />
      )
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
    console.log(newRating)
  }
  render() {

    return (
      <div className="App">
        <header className="App-header">
          <div className="display-4 quoteText mb-4">{this.state.currentQuote || 'Ron Swanson Quotes'}</div>
          {this.showRating()}
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

export default App;
