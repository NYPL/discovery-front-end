import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router';

import SubjectHeadingsTable from './SubjectHeadingsTable';
import BibsList from './BibsList';
import Range from '../../models/Range';
import appConfig from '../../data/appConfig';
import Actions from '../../actions/Actions';


class SubjectHeadingShow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mainHeading: {
        uuid: this.props.params.subjectHeadingUuid,
        label: '',
      },
      shepBibs: [],
    };

    this.generateFullContextUrl = this.generateFullContextUrl.bind(this);
    this.hasUuid = this.hasUuid.bind(this);
    this.getTopLevelLabel = this.getTopLevelLabel.bind(this);
    this.processContextHeadings = this.processContextHeadings.bind(this);
    this.removeChildrenOffMainPath = this.removeChildrenOffMainPath.bind(this);
  }

  componentDidMount() {
    const { uuid } = this.state.mainHeading;

    axios(`${appConfig.baseUrl}/api/subjectHeadings/subject_headings/${uuid}/context`)
      .then((res) => {
        this.setState({
          contextHeadings: this.processContextHeadings(res.data.subject_headings, uuid),
          mainHeading: {
            label: res.data.request.main_label,
          },
        }, () => {
          this.props.setBannerText(this.state.mainHeading.label);
          Actions.updateLoadingStatus(false);
        });
      })
      .catch(
        (err) => {
          console.error('error: ', err);
          this.setState({ error: true });
        },
      );

    axios({
      url: `${appConfig.baseUrl}/api/subjectHeadings/subject_headings/${uuid}/bibs`,
    })
      .then((res) => {
        this.setState({
          shepBibs: res.data.bibs,
          bibsNextUrl: res.data.next_url,
        });
      })
      .catch(
        (err) => {
          console.error('error: ', err);
          this.setState({ error: true });
        },
      );

    axios({
      url: `${appConfig.baseUrl}/api/subjectHeadings/subject_headings/${uuid}/related`,
    })
      .then((res) => {
        this.setState({
          relatedHeadings: res.data.related_headings,
        });
      })
      .catch(
        (err) => {
          console.error('error: ', err);
        },
      );
  }


  getTopLevelLabel() {
    const {
      contextHeadings,
    } = this.state;
    let indexOfTopLevelAncestor = contextHeadings.findIndex(this.hasUuid);
    indexOfTopLevelAncestor = Math.max(indexOfTopLevelAncestor - 1, 0);
    return contextHeadings[indexOfTopLevelAncestor].label;
  }

  hasUuid(headings) {
    const uuid = this.props.params.subjectHeadingUuid;
    if (Array.isArray(headings)) return headings.some(heading => this.hasUuid(heading));
    return headings.uuid === uuid || this.hasUuid(headings.children || []);
  }

  generateFullContextUrl() {
    const uuid = this.props.params.subjectHeadingUuid;
    const linkFromLabel = this.getTopLevelLabel();
    const path = this.props.location.pathname.replace(/\/subject_headings.*/, '');
    return `${path}/subject_headings?fromLabel=${linkFromLabel}&fromComparator=start&linked=${uuid}`;
  }

  // returns true or false depending on whether the heading has a descendant with the given uuid.
  // If not, removes the children of that heading
  removeChildrenOffMainPath(heading, uuid) {
    const onMainPath =
      heading.uuid === uuid ||
      (heading.children &&
        heading.children.some(child => this.removeChildrenOffMainPath(child, uuid))
      );
    if (!onMainPath) heading.children = null;
    return onMainPath;
  }

  processContextHeadings(headings, uuid) {
    headings.forEach((heading) => {
      this.removeChildrenOffMainPath(heading, uuid);
      Range.addRangeData(heading, uuid, 'show');
    });
    const mainHeadingIndex = headings.findIndex(heading =>
      heading.children || heading.uuid === uuid
    );
    const startIndex = mainHeadingIndex > 0 ? mainHeadingIndex - 1 : 0;
    const endIndex = mainHeadingIndex + 2;
    return headings.slice(startIndex, endIndex);
  }

  render() {
    const {
      contextHeadings,
      relatedHeadings,
      shepBibs,
      bibsNextUrl,
      error,
      mainHeading,
    } = this.state;

    const { uuid } = mainHeading;

    const { location } = this.props;

    if (error) {
      return (<div>Not a subject heading</div>);
    }
    return (
      <React.Fragment>
        {shepBibs.length > 0 ?
          <BibsList
            shepBibs={shepBibs}
            nextUrl={bibsNextUrl}
          />
          :
          <div
            className="nypl-column-half bibs-list"
            tabIndex='0'
            aria-label='Neighboring Subject Headings'
          />
        }
        <div
          className="nypl-column-half subjectHeadingContext subjectHeadingInfoBox"
          tabIndex='0'
          aria-label='Neighboring Subject Headings'
        >
          <div className="backgroundContainer">
            <h4>Neighboring Subject Headings</h4>
          </div>
          <SubjectHeadingsTable
            subjectHeadings={contextHeadings}
            location={location}
            showId={uuid}
            keyId="context"
            container="context"
          />
          <Link
            to={contextHeadings && contextHeadings.length ? this.generateFullContextUrl() : '#'}
            className="link toIndex"
          >
            Go to Subject Headings Index
          </Link>
        </div>
        <div
          className="nypl-column-half subjectHeadingRelated subjectHeadingInfoBox"
          tabIndex='0'
          aria-label='Related Subject Headings'
        >
          <div className="backgroundContainer">
            <h4>Related Headings</h4>
          </div>
          <SubjectHeadingsTable
            subjectHeadings={relatedHeadings}
            location={location}
            keyId="related"
            container="narrower"
          />
        </div>
      </React.Fragment>
    );
  }
}

SubjectHeadingShow.propTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
  setBannerText: PropTypes.func,
};

SubjectHeadingShow.contextTypes = {
  router: PropTypes.object,
};


export default SubjectHeadingShow;
