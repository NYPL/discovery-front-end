import React from 'react';
import DefinitionList from './DefinitionList';


class AdditionalDetailsViewer extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      display: true
    }
    this.toggleState = this.toggleState.bind(this);
    this.definitionItem = this.definitionItem.bind(this);
  }

  toggleState(){
    this.setState({display: !this.state.display});
  }

  definitionItem(value, index = 0){
    const link = (<a  href={value.content} title={JSON.stringify(value.source, null, 2)}> {value.label} </a> );

    return (  <div title={JSON.stringify(value.source, null, 2)} key={index}>
                { value.label ? link :  value.content}
                { value.parallels ? parallels : null}
      </div> )
  }


  render (){
    if (!this.props.bib || !this.props.bib.annotatedMarc) return null;

    const annotatedMarcDetails = this.props.bib.annotatedMarc.bib.fields.map((field) => {
      return {
        term: field.label,
        definition: field.values.map(this.definitionItem)
      }
    })

    // <button onClick = {this.toggleState}>{this.state.display ? "Hide Full Record" : "View Full Record"}</button>
    return(
      <div>
      {this.state.display && annotatedMarcDetails ? (
        <div className={"additionalDetails"} style={{padding: '5px 20px', position: 'relative', left: '-20px'}}>
          <DefinitionList data={annotatedMarcDetails} />
        </div>
        ) : null}
      </div>
    )
  }
}


export default AdditionalDetailsViewer;
