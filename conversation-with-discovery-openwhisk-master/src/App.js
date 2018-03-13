import React, { Component } from 'react';
import './App.css';
import Conversation from './Conversation.js';
import DiscoveryResult from './DiscoveryResult.js';

const headerMessage  = "これはクイック導入パックのサンプルアプリです";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      context: {},
      // A Message Object consists of a message[, intent, date, isUser]
      messageObjectList: [],
      feedbackList: [],
      discoveryNumber: 0,
      reviewObjList:　[],
      discoverResponse: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.showChildState = this.showChildState.bind(this);
    this.callWatson('hello');
  }

  callWatson(message) {
    const watsonApiUrl = process.env.REACT_APP_API_URL;
    const requestJson = JSON.stringify({
      input: {
        text: message
      },
      context: this.state.context
    });

    return fetch(watsonApiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: requestJson
      }
    ).then((response) => {
      if(!response.ok) {
        throw response;
      }
      return(response.json());
    })
      .then((responseJson) => {
        responseJson.date = new Date();
        this.handleResponse(responseJson);
      }).catch(function(error) {
        throw error;
      });
  }

  handleResponse(responseJson) {
    if(responseJson.hasOwnProperty('output') && responseJson.output.hasOwnProperty('action') && responseJson.output.action.hasOwnProperty('call_discovery')) {
      this.addMessage( { label: 'Discovery Result:', message: '検索結果はこちらです:', date: (new Date()).toLocaleTimeString()});
      this.formatDiscovery(responseJson.output.discoveryResults, responseJson.input.text);
      this.setState({ discoverResponse: true });

    } else {

      const outputMessage = responseJson.output.text.filter(text => text).join('\n');
      const outputIntent = responseJson.intents[0] ? responseJson.intents[0]['intent'] : '';
      const outputDate = responseJson.date.toLocaleTimeString();
      const outputContext = responseJson.context;
      this.setState({
        context: outputContext
      });
      const msgObj = {
        position: 'left',
        label: outputIntent,
        message: outputMessage,
        date: outputDate,
        hasTail: true
      }
      this.addMessage(msgObj);
    }
	console.log("log:" + JSON.stringify(responseJson));
	//TODO update to CloudantDB
  }

  addMessage(msgObj) {
    this.setState({
      messageObjectList: [ ...this.state.messageObjectList , msgObj],discoverResponse: false
    });
  }

  handleSubmit(e) {
    const inputMessage = e.target.value;
    const inputDate = new Date();
    const formattedDate = inputDate.toLocaleTimeString();
    const msgObj = {
      position: 'right',
      message: inputMessage,
      date: formattedDate,
      hasTail: true
    };
    this.addMessage(msgObj);
    e.target.value = '';
    this.callWatson(inputMessage);
  }
  showChildState(childStateObj) {

    var tmp = this.state.reviewObjList.filter(function(item, index) {
        if (item.button_id !== childStateObj.button_id) return true;
        return(false);
    });
    this.setState({
      reviewObjList: [...tmp, childStateObj]

    });
  }

  formatDiscovery(resultArr, queryString) {
    resultArr.map(function(result, index) {
      const formattedResult =
        <DiscoveryResult
          key={'d' + this.state.discoveryNumber + index}
          buttonId={'d' + this.state.discoveryNumber + index}
          title={result.title} preview={result.bodySnippet}
          docId={result.id}
          link={result.sourceUrl}
          linkText={'See full manual entry'}
          queryString={queryString}
          showChildState={this.showChildState}
          discoNumber={this.state.discoveryNumber}
        />;
      this.addMessage({ message: formattedResult });
    }.bind(this));

    const submitForm =
      <div className="submitform" key={'d' + this.state.discoveryNumber}>
        <button className="submitbutton" onClick={this.submitFeedback.bind(this)}>Submit above reviews</button>
      </div>;

    this.addMessage({message: submitForm});
    this.setState({
      discoveryNumber: this.state.discoveryNumber + 1
    });
    return(false);
  }

  scrollToBottom() {
    const element = document.getElementsByClassName('conversation__messages')[0];
    element.scrollTop = element.scrollHeight;
  }

  componentDidUpdate() {
    if(this.state.discoverResponse !== true) {
      this.scrollToBottom();
      this.setState({ discoverResponse: true });
    }
  }

  submitFeedback(e){
  	console.log("submit click");
	  console.log('reviewObjList :', this.state.reviewObjList);
	  //TODO :format log
	  //TODO :post cloudant db
    let data = this.state.reviewObjList;

    // fetch('/feedbacklog?name=1', {method: 'POST', body: JSON.stringify(data)})
    fetch('/feedbacklog',
      {

        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          //'Authorization': "Basic " + (user00 + ":" + pass00).encode("base64")[:-1]
          //linuxでこのコマンドで確認できる「php -r 'echo base64_encode("user00:pass00");'」
          'Authorization': 'Basic dXNlcjAwOnBhc3MwMA=='
        },
        body: JSON.stringify(data)

/*
        'POST',
        {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Basic dXNlcjAwOnBhc3MwMA==',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: JSON.stringify(data)
*/
      }
    )
    .then(function(res){
      console.log(res);
    })
    .catch(function(error){
      console.error(error);
    });
 }


  render() {
    return(
      <div className="app-wrapper">
        <p className="conversation__intro">
	  		{headerMessage}
        </p>
        <Conversation
          onSubmit={this.handleSubmit}
          messageObjectList={this.state.messageObjectList}
        />
      </div>
    );
  }
}





export default App;
