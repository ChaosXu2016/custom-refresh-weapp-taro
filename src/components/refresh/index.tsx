import Taro, { Component } from '@tarojs/taro'
import { View, Image, ScrollView } from '@tarojs/components'
import refreshIcon from '@/assets/imgs/refresh.png'
import loadingIcon from '@/assets/imgs/loading.png'
import doneIcon from '@/assets/imgs/done.png'

import './index.less'

enum refreshStatus {
  INIT,
  PULL_DOWN,
  READY_REFRESH,
  LOADING,
  DONE
}

interface RefreshContainer {
  state: {
    refreshStatu: refreshStatus
    refreshHeight: number
  },
  props: {
    onRefresh?: any
    children?: any
    hasMore?: boolean
    onLoadMore?: any
    refreshing?: boolean
    scrollViewHeight: number
  }
}

class RefreshContainer extends Component {
  lastTouchY = 0
  isUpper = true
  maxHeight = 50
  validHeight = 30

  data = {
    refreshHeight: 0,
    refreshing: false,
    loading: false,
    refreshStatu: refreshStatus.INIT
  }
  constructor(props) {
    super(props)
    this.state = this.data
  }
  componentWillReceiveProps(newProps) {
    if(!newProps.refreshing) {
      this.setState({
        refreshHeight: 0
      }, () => {
      })
      const loadingAnimate = setTimeout(() => {
        this.setState({
          refreshStatu: refreshStatus.DONE
        })
        clearTimeout(loadingAnimate)
      }, 200)
    }
  }
  handleTouchMove(e) {
    const curTouch = e.touches[0]
    const moveY = (curTouch.pageY - this.lastTouchY) * .3
    if(
      !this.isUpper ||
      moveY < 0 || 
      moveY > 2 * this.maxHeight ||
      this.state.refreshStatu === refreshStatus.LOADING
    ) {
      return
    }
    if(moveY < this.validHeight) {
      this.setState({
        refreshHeight: moveY,
        refreshStatu: refreshStatus.PULL_DOWN
      })
    } else {
      this.setState({
        refreshHeight: moveY,
        refreshStatu: refreshStatus.READY_REFRESH
      })
    }
  }
  handleScrollToLower() {
    if (this.props.hasMore && this.props.onLoadMore && this.state.refreshStatu !== refreshStatus.LOADING) {
      this.props.onLoadMore()
    }
  }
  handleTouchStart(e) {
    const curTouch = e.touches[0]
    this.lastTouchY = curTouch.pageY
  }
  handleTouchEnd() {
    this.lastTouchY = 0
    if(this.state.refreshStatu === refreshStatus.READY_REFRESH) {
      this.setState({
        refreshStatu: refreshStatus.LOADING,
        refreshHeight: this.maxHeight
      })
      if (this.props.onRefresh) {
        this.props.onRefresh()
      }
    } else {
      this.setState({
        refreshHeight: 0
      })
    }
  }
  handleScrollToUpeper() {
    this.isUpper = true
  }
  handleScroll() {
    this.isUpper = false
  }
  render() {
    const { refreshHeight, refreshStatu } = this.state
    return (
      <ScrollView
        className="refresh-scroll-view"
        style={{height: this.props.scrollViewHeight + 'rpx'}}
        onScrollToUpper={this.handleScrollToUpeper.bind(this)}
        onScroll={this.handleScroll.bind(this)}
        onScrollToLower={this.handleScrollToLower.bind(this)}
        scrollY={true}
      >
        <View className={`refresh-icon-view ${refreshStatu === refreshStatus.LOADING ? 'loading' : ''}`} style={{ height: refreshHeight + 'px' }}>
          <Image className={`refresh-icon ${refreshStatu === refreshStatus.LOADING ? 'loading' : ''}`} src={refreshIcon} style={{ transform: `rotate(${(refreshHeight / this.maxHeight) * 360}deg)` }}></Image>
        </View>
        <View
          className="refresh-body-view"
          onTouchMove={this.handleTouchMove.bind(this)}
          onTouchStart={this.handleTouchStart.bind(this)}
          onTouchEnd={this.handleTouchEnd.bind(this)}
        >
          { this.props.children }
        </View>
        <View className="load-more-view">
          {
            this.props.hasMore ? (
              <Image className="load-more-icon loading" src={loadingIcon}></Image>
            ) : (
              <Image className="load-more-icon" src={doneIcon}></Image>
            )
          }
        </View>
      </ScrollView>
    )
  }
}

export default RefreshContainer
