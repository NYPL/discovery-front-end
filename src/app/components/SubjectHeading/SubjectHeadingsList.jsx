/* globals document */
import React from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import axios from 'axios';
import SubjectHeading from './SubjectHeading';
import AdditionalSubjectHeadingsButton from './AdditionalSubjectHeadingsButton';
import Range from '../../models/Range';
import appConfig from '../../../../appConfig';

class SubjectHeadingsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subjectHeadings: props.subjectHeadings,
      range: this.initialRange(props),
    };
    this.updateRange = this.updateRange.bind(this);
    this.inRangeHeadings = this.inRangeHeadings.bind(this);
    this.inIntervalHeadings = this.inIntervalHeadings.bind(this);
    this.addRangeData = this.addRangeData.bind(this);
  }

  componentDidUpdate() {
    if (!this.state.subjectHeadings) {
      const newSubjectHeadings = this.props.subjectHeadings
      this.setState(
        { subjectHeadings: newSubjectHeadings,
          range: this.initialRange({ subjectHeadings: newSubjectHeadings }),
        }, () => {
          const { linked } = this.props;
          if (linked) {
            axios({
              method: 'GET',
              url: `${appConfig.shepApi}/subject_headings/${linked}/context?type=relatives`,
              crossDomain: true,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
              },
            })
              .then(
                (res) => {
                  this.mergeSubjectHeadings(res.data.subject_headings, linked);
                },
              );
          }
        });
    }
  }

  componentDidMount() {
    window.lists = window.lists || [];
    window.lists.push(this);
  }

  mergeSubjectHeadings(subjectHeadings, linked) {
    const responseSubjectHeading = subjectHeadings[0];
    this.addRangeData(responseSubjectHeading, linked);
    const existingSubjectHeadingIndex = this.state.subjectHeadings.findIndex(
      heading => heading.uuid === responseSubjectHeading.uuid,
    );
    this.state.subjectHeadings[existingSubjectHeadingIndex] = responseSubjectHeading;
    this.setState(prevState => prevState);
  }

  addRangeData(subjectHeading, linked) {
    subjectHeading.range = Range.fromSubjectHeading(subjectHeading, linked);
    if (subjectHeading.children) subjectHeading.children.forEach(child => this.addRangeData(child));
  }

  initialRange(props) {
    if (props.range) return props.range;
    if (props.subjectHeadings) return new Range(0, 'infinity', [{ start: 0, end: 'infinity' }]);
    return null;
  }

  updateRange(rangeElement, intervalElement, endpoint, increment) {
    intervalElement[endpoint] += increment;
    rangeElement.normalize();
    this.setState({ range: rangeElement });
  }

  inRangeHeadings() {
    const {
      range,
      subjectHeadings,
    } = this.state;
    return range.intervals.reduce((acc, el) =>
      acc.concat(this.inIntervalHeadings(el))
      , []);
  }

  inIntervalHeadings(interval) {
    const { indentation } = this.props;
    const { subjectHeadings, range } = this.state;
    const { start, end } = interval;
    const subjectHeadingsInInterval = subjectHeadings.filter((el, i) => i >= start && (end === 'infinity' || i <= end));
    if (subjectHeadings[start - 1]) {
      subjectHeadingsInInterval.unshift({
        button: 'previous',
        indentation,
        updateParent: element => this.updateRange(range, interval, 'start', -10),
      });
    };
    if (end !== 'infinity' && subjectHeadings[end + 1]) {
      subjectHeadingsInInterval.push({
        button: 'next',
        indentation,
        updateParent: element => this.updateRange(range, interval, 'end', 10),
      });
    }
    return subjectHeadingsInInterval;
  }

  render() {

    const {
      indentation,
      nested,
    } = this.props;

    const {
      subjectHeadings,
    } = this.state;

    return (
      <ul className={nested ? 'subjectHeadingList nestedSubjectHeadingList' : 'subjectHeadingList'}>
        {
          subjectHeadings ?
          this.inRangeHeadings(subjectHeadings)
          .map(subjectHeading => (subjectHeading.button ?
            <AdditionalSubjectHeadingsButton
              indentation={subjectHeading.indentation}
              button={subjectHeading.button}
              updateParent={subjectHeading.updateParent}
              key={subjectHeading.uuid}
              nested={nested}
              indentation={indentation}
            />
            : <SubjectHeading
              subjectHeading={subjectHeading}
              key={subjectHeading.uuid}
              nested={nested}
              indentation={indentation}
            />
          )) :
          null
        }
      </ul>
    );
  }
}

SubjectHeadingsList.propTypes = {
  nested: PropTypes.string,
  subjectHeadings: PropTypes.array,
  indentation: PropTypes.number,
  linked: PropTypes.string,
};

export default SubjectHeadingsList;
