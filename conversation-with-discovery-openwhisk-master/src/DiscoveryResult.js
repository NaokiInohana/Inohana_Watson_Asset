import React, { Component } from 'react';
import './DiscoveryResult.css';
import { ButtonsGroup } from 'watson-react-components';


class DiscoveryResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reviewObj:{}
    };
    this.reviewAction = this.reviewAction.bind(this);
  }

  reviewAction(e) {
    //console.log(e.target.value);
    this.setState({
      reviewObj:
        {
          title: this.props.title,
          document_id: this.props.docId,
          relevance: e.target.value
        }
    });
    //console.log(this.state.reviewObj);
    this.props.showChildState({
          discoNumber: this.props.discoNumber,
          button_id: this.props.buttonId,
          queryString: this.props.queryString,
          examples: {
            title: this.props.title,
            document_id: this.props.docId,
            relevance: e.target.value
          }
        });
  }
  render() {
    return (
      <div className="result">
        <div className="result__title">{this.props.title}</div>
        <div className="result__preview">{this.props.preview}</div>
        <div className="result__link"><a href={this.props.link} target="_blank">{this.props.linkText}</a></div>
        <div className="result__review">
          <ButtonsGroup
            type="radio"  // radio, button, or checkbox
            name={this.props.buttonId}
            onClick={this.reviewAction}
            buttons={[{
              value: 'Relevant',
              id: this.props.buttonId + '1',  // id's must be unique across the entire page. Default value is name-value
              text: 'Relevant',
              }, {
              value: 'NotRelevant',
              id: this.props.buttonId + '2',
              text: 'Not Relevant',
            }]}
          />
        </div>
      </div>
    );
  }
}

export default DiscoveryResult;
