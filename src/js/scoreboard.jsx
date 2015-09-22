var Scoreboard = React.createClass({
  render: function() {
    return (
      <div>
        Current Time: <Clock />
        <div>Scoreboard Time: {this.state.stateTime}</div>
        <div className="ui center aligned red header">The scoreboard will be freezed after {this.state._settings.freezeTime} minutes.</div>
        <table className="ui striped unstackable selectable table">
          <TableHeader _settings={this.state._settings} />
          <Ranking _status={this.state._status} _teams={this.state._teams} />
          <TableHeader _settings={this.state._settings} />
        </table>
      </div>
    );
  },
  componentDidMount: function() {
    this.loadTeams();
    this.loadStatus();
    this.loadSettings();
    document.getElementById('autoReload').onchange = this.loadStatus;
  },
  getInitialState: function() {
    return { _status: [], _settings: [], _teams: [], stateTime: "----/--/-- --:--:--" };
  },
  loadStatus: function() {
    if( !$("#autoReload").prop('checked') ) {
      stopTimeout(this.tick);
      return;
    }
    $(".loader").fadeIn(500);
    $.ajax({
      url: this.props.statusUrl,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({_status: data["status"], stateTime: data["generateTime"]});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.statusUrl, status, err.toString());
      }.bind(this),
      complete: function() {
        $(".loader").fadeOut(500);
        this.tick = setTimeout(this.loadStatus, 30000);
      }.bind(this)
    });
  },
  loadTeams: function() {
    $.ajax({
      url: this.props.teamsUrl,
      dataType: 'json',
      success: function(data) {
        this.setState({_teams: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.teamsUrl, status, err.toString());
      }.bind(this)
    });
  },
  loadSettings: function() {
    $.ajax({
      url: this.props.settingsUrl,
      dataType: 'json',
      success: function(data) {
        this.setState({_settings: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.settingsUrl, status, err.toString());
      }.bind(this)
    });
  }
});

var Clock = React.createClass({
  render: function() {
    var options = {
      timeZone: 8,
      hour12: false
    };
    return (
      <span>{this.formatDate(this.state.time)}</span>
    );
  },
  getInitialState: function() {
    return {time: new Date()};
  },
  componentDidMount: function() {
    this.timer = setInterval(this.tick, 1000);
  },
  componentWillUnmount: function() {
    clearInterval(this.timer);
  },
  tick: function() {
    this.setState({time: new Date()});
  },
  formatDate: function(date) {
    var month = date.getMonth() + 1;
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    month = month < 10 ? '0'+month : month;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    seconds = seconds < 10 ? '0'+seconds : seconds;
    return date.getFullYear() + "/" + month + "/" + date.getDate() + "  " + date.getHours() + ':' + minutes + ':' + seconds;
  }
});

var TableHeader = React.createClass({
  render: function() {
    document.title = this.props._settings.contestName || "";
    var ths = [
      <th>Rank</th>,
      <th>Name</th>,
      <th>Solved</th>,
      <th>Time</th>
    ];
    for(var i=0; i<this.props._settings.problemNum; i++) {
      ths.push(<th>{String.fromCharCode(65+i)}</th>);
    }
    return (
      <thead>
        <tr>
          {ths}
        </tr>
      </thead>
    );
  }
});

var Ranking = React.createClass({
  render: function() {
    var
      _status = this.props._status,
      _teams = this.props._teams;

    _status.sort(function(a, b) {
      return (b.solvedN-a.solvedN) || (a.totalPenalty-b.totalPenalty) || (a.teamID-b.teamID);
    });
    ranking = [];
    for(var i=0, j=0; i<_status.length; i++) {
      if( _status[i].solvedN != _status[j].solvedN || _status[i].totalPenalty != _status[j].totalPenalty )
        j = i;
      var teamName = "team"+_status[i].teamID;
      for(var t in _teams) {
        if( _teams[t].teamID == _status[i].teamID ) {
          teamName = _teams[t].name || teamName;
          break;
        }
      }
      ranking.push(<Team rank={j+1} result={_status[i]} teamName={teamName} />)
    }
    return (
      <tbody>
        {ranking}
      </tbody>
    );
//  {JSON.stringify(this.state._status, null, '  ')}
  },
});

var Team = React.createClass({
  render: function() {
    var result = this.props.result;
    var cx = React.addons.classSet;
    var tds = [
      <td>{this.props.rank}</td>,
      <td>{this.props.teamName}</td>,
      <td>{result.solvedN}</td>,
      <td>{result.totalPenalty}</td>
    ];
    for(var i in result.solved) {
      var cls_status = cx({
        'submitted': result.submitN[i]>0,
        'solved': result.solved[i],
        'firstBlood': result.firstBlood[i],
        'pending': result.pending[i]
      });
      tds.push(<td className={cls_status}><i className="icon"></i>&nbsp;{result.submitN[i]+"/"+(result.solved[i] ? result.penalty[i] : "--")}</td>);
    }
    return (
      <tr>
        {tds}
      </tr>
    );
  },
  componentDidMount: function() {
    this.componentDidUpdate();
  },
  componentDidUpdate: function() {
    var $elem = $(this.getDOMNode());
    $elem.find("i.icon").attr('class', 'icon');
    $elem.find(".pending:not(.solved) i.icon").attr('class', 'yellow wait icon');
    $elem.find(".submitted:not(.pending):not(.solved) i.icon").attr('class', 'red close icon');
    $elem.find(".solved i.icon").attr('class', 'green checkmark icon');
  }
});

React.render(
  <Scoreboard settingsUrl="settings.json" teamsUrl="teams.json" statusUrl="status.json" />,
  document.getElementById('scoreboard')
)

