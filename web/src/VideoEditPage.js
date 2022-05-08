import React from "react";
import {Button, Card, Col, Input, Row} from 'antd';
import * as VideoBackend from "./backend/VideoBackend";
import * as Setting from "./Setting";
import i18next from "i18next";
import {LinkOutlined} from "@ant-design/icons";
import Video from "./Video";
import LabelTable from "./LabelTable";

class VideoEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      videoName: props.match.params.videoName,
      video: null,
    };
  }

  componentWillMount() {
    this.getVideo();
  }

  getVideo() {
    VideoBackend.getVideo(this.props.account.name, this.state.videoName)
      .then((video) => {
        this.setState({
          video: video,
          currentTime: 0,
        });
      });
  }

  parseVideoField(key, value) {
    if (["score"].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateVideoField(key, value) {
    value = this.parseVideoField(key, value);

    let video = this.state.video;
    video[key] = value;
    this.setState({
      video: video,
    });
  }

  renderVideoContent() {
    let task = {};
    task.video = {
      vid: this.state.video.videoId,
      playAuth: this.state.video.playAuth,
      cover: this.state.video.coverUrl,
      videoWidth: 1920,
      videoHeight: 1080,
      width: "840px",
      autoplay: false,
      isLive: false,
      rePlay: false,
      playsinline: true,
      preload: true,
      controlBarVisibility: "hover",
      useH5Prism: true,
    };

    return (
      <div style={{marginTop: "10px", textAlign: "center"}}>
        {/*{*/}
        {/*  JSON.stringify(this.state.video)*/}
        {/*}*/}
        <div style={{fontSize: 30, marginBottom: "20px"}}>
          {
            this.state.video.name
          }
        </div>
        <Video task={task} onUpdateTime={(time) => {this.setState({currentTime: time})}} />
      </div>
    )
  }

  renderVideo() {
    return (
      <Card size="small" title={
        <div>
          {i18next.t("video:Edit Video")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" onClick={this.submitVideoEdit.bind(this)}>{i18next.t("general:Save")}</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("general:Name")}:
          </Col>
          <Col span={22} >
            <Input value={this.state.video.name} onChange={e => {
              this.updateVideoField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("general:Display name")}:
          </Col>
          <Col span={22} >
            <Input value={this.state.video.displayName} onChange={e => {
              this.updateVideoField('displayName', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("video:Video ID")}:
          </Col>
          <Col span={22} >
            <Input value={this.state.video.videoId} onChange={e => {
              this.updateVideoField('videoId', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("video:Cover")}:
          </Col>
          <Col span={22} style={(Setting.isMobile()) ? {maxWidth:'100%'} :{}}>
            <Row style={{marginTop: '20px'}} >
              <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 1}>
                {i18next.t("general:URL")} :
              </Col>
              <Col span={23} >
                <Input prefix={<LinkOutlined/>} value={this.state.video.coverUrl} onChange={e => {
                  this.updateVideoField('coverUrl', e.target.value);
                }} />
              </Col>
            </Row>
            <Row style={{marginTop: '20px'}} >
              <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 1}>
                {i18next.t("general:Preview")}:
              </Col>
              <Col span={23} >
                <a target="_blank" rel="noreferrer" href={this.state.video.coverUrl}>
                  <img src={this.state.video.coverUrl} alt={this.state.video.coverUrl} height={90} style={{marginBottom: '20px'}}/>
                </a>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("video:Video")}:
          </Col>
          <Col span={22} style={(Setting.isMobile()) ? {maxWidth:'100%'} :{}}>
            {
              this.state.video !== null ? this.renderVideoContent() : null
            }
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("video:Current time (second)")}:
          </Col>
          <Col span={22} style={(Setting.isMobile()) ? {maxWidth:'100%'} :{}}>
            {
              this.state.currentTime
            }
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("video:Labels")}:
          </Col>
          <Col span={22} >
            <LabelTable
              title={i18next.t("video:Labels")}
              table={this.state.video.labels}
              currentTime={this.state.currentTime}
              onUpdateTable={(value) => {this.updateVideoField('labels', value)}}
            />
          </Col>
        </Row>
      </Card>
    )
  }

  submitVideoEdit() {
    let video = Setting.deepCopy(this.state.video);
    VideoBackend.updateVideo(this.state.video.owner, this.state.videoName, video)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            videoName: this.state.video.name,
          });
          this.props.history.push(`/videos/${this.state.video.name}`);
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
          this.updateVideoField('name', this.state.videoName);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  render() {
    return (
      <div>
        <Row style={{width: "100%"}}>
          <Col span={1}>
          </Col>
          <Col span={22}>
            {
              this.state.video !== null ? this.renderVideo() : null
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
        <Row style={{margin: 10}}>
          <Col span={2}>
          </Col>
          <Col span={18}>
            <Button type="primary" size="large" onClick={this.submitVideoEdit.bind(this)}>{i18next.t("general:Save")}</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default VideoEditPage;