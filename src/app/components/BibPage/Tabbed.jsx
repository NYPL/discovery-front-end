import React from 'react';
import { trackDiscovery } from '../../utils/utils';

class Tabbed extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      numberOfTabs: this.props.tabs.length
    };
    this.clickHandler = this.clickHandler.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.links = [];
    this.sections = [];
  }

  // componentDidMount () {
  //   if(!this.state.tabNumber){
  //     let tab;
  //     if(this.props.hash){
  //       tab = document.getElementById(`link${this.props.hash[4]}`);
  //     }
  //     let tabNum = this.props.hash[4] || '0';
  //     this.setState({ tabNumber: tabNum });
  //     window.location.href = window.location.href.split("#")[0] + `#ind${tabNum}`;
  //   }
  // }

  componentDidMount () {
      let hashNumber = 1;
      if (this.props.hash) {
        let hash = this.props.hash
        //hashNumber = this.props.hash[4];
        hashNumber = this.props.hash.match(/[^\d]*(\d)/)[1];
        window.location.href += hash; //might want to change this?
        //console.log(hash);
        //let tab = document.getElementById(`link${hash[8]}`);
        console.log(hashNumber);
        let tab = this.links[hashNumber];
        tab.focus();
      } else {
        // window.location.href += "#section0"
      }
      this.setState({tabNumber: hashNumber.toString()});
  }

  focusTab (newTabIndex) {
    let newTab = this.links[newTabIndex];
    newTab.focus();
  }

  switchTab (newTabIndex) {
    // const index  = parseInt(newTab.getAttribute('data'));
    if (newTabIndex !== this.state.tabNumber) {
      const tabChoices = ['Details', 'Full Description'];
      trackDiscovery('BibPage Tabs Switch', tabChoices[newTabIndex-1]);
    }
    this.setState({ tabNumber: newTabIndex.toString() }); //prop vs attribute
    //let newTab = document.getElementById(`link${newTabIndex}`);
    //console.log(this.links);
    let newTab = this.links[newTabIndex];
    // newTab.click();
    window.location.replace(window.location.href.split('#')[0] + `#tab${newTabIndex}`);
    newTab.focus(); //this may need to be changed because of re-rendering and synchronicity issues
  }

  clickHandler (e) {
    e.preventDefault();
    let clickedTab = e.currentTarget;
    let index = clickedTab.getAttribute('data');
    // window.location.href = window.location.href.split("#")[0] + `#dummy${index}`;
    this.switchTab(index);
  }

  keyDownHandler (e) {
    //const sectionNumber = e.currentTarget.href.split("#")[1][2];
    //const panel = document.getElementById(sectionNumber);
    //let panel = this.refs.sections[sectionNumber];
    //console.log(this.state.tabNumber)
    let panel = window.location.href.split("#")[1] ? this.sections[this.state.tabNumber] : this.default
    const index = parseInt(e.currentTarget.getAttribute('data'));
    let dir = e.which === 37 ? index - 1 : e.which === 39 ? index + 1 : e.which === 40 ? 'down' : null;
    if (dir !== null) {
      e.preventDefault();
      dir ===  'down' ? panel.focus() : dir <= this.state.numberOfTabs && 0 <= dir ? this.focusTab(dir) : void 0;
    }
  }


  render () {
    return(
      <div className="tabbed">
        <ul role='tablist'>
          { this.props.tabs.map((tab, i) => {
            let j = i + 1;
            return(
                <li id={`tab${j}`} className={(parseInt(this.state.tabNumber) === j ? 'activeTab' : null) } role='presentation'><h4 role='presentation'><a href={`#tab${j}`}
                id={`link${j}`}
                 tabIndex={!this.state.tabNumber ?  '0' : parseInt(this.state.tabNumber) === j ? null : -1}
                  aria-selected={this.state.tabNumber && j === parseInt(this.state.tabNumber) ? true: false}
                  role='tab'
                  data={`${j}`}
                  onClick={this.clickHandler}
                  onKeyDown={this.keyDownHandler}
                  ref={(input) => {this.links[`${j}`] = input;}}
                  >{tab.title}</a></h4></li>
             )
          })
        }
        <li className={"blank"}>" "</li>

        {
          this.props.tabs.map((tab, i) => {
            let j = i+1;
            return (
              <section id={`section${j}`}
              className={this.state.tabNumber ? 'non-default' : 'non-default'}
              tabIndex={!this.state.tabNumber ? '0' : '0'}
              ref={(input) => {this.sections[`${j}`] = input;}}
              aria-labelledby={`link${j}`}
              >
              <br/>
              {this.props.tabs[i].content}
              </section>
            )
          })
        }
        <section className='default' tabIndex={!this.state.tabNumber ?  '0' : '0'}
        ref={(input) => {this.default = input;}}
        aria-labelledby={'link1'}
        >
        <br/>
        {this.props.tabs[0].content}
        </section>
        </ul>
        </div>
    )
  }


}

export default Tabbed;
