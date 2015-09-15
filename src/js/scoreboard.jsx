var Scoreboard = React.createClass({
  render: function() {
    return (
      <div>
        <div>Scoreboard Time: {this.state.stateTime}</div>
        <table>
          <Header settingsUrl={this.props.settingsUrl} />
          <Ranking _status={this.state._status} />
        </table>
      </div>
    );
  },
  componentDidMount: function() {
    this.loadJSON();
    var $elem = $(this.getDOMNode()).children("table");
    $elem.addClass("ui striped table");
  },
  getInitialState: function() {
    return { _status: [], stateTime: "----/--/-- --:--:--" };
  },
  loadJSON: function() {
    $("#loader").fadeIn(500);
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
        $("#loader").fadeOut(500);
        setTimeout(this.loadJSON, 10000);
      }.bind(this)
    });
  }
});

var Header = React.createClass({
  render: function() {
    var ths = [
      <th>Rank</th>,
      <th>Name</th>,
      <th>Solved</th>,
      <th>Time</th>
    ];
    for(var i=0; i<this.state._settings.problemNum; i++) {
      ths.push(<th>{String.fromCharCode(65+i)}</th>);
    }
    return (
      <thead>
        <tr>
          {ths}
        </tr>
      </thead>
    );
  },
  getInitialState: function() {
    return { _settings: {} };
  },
  componentDidMount: function() {
    this.loadJSON();
  },
  loadJSON: function() {
    $.ajax({
      url: this.props.settingsUrl,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({_settings: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.settingsUrl, status, err.toString());
      }.bind(this)
    });
  }
});

var Ranking = React.createClass({
  render: function() {
    var _status = this.props._status;
    _status.sort(function(a, b) {
      return (b.solvedN-a.solvedN) || (a.totalPenalty-b.totalPenalty);
    });
    ranking = [];
    for(var i=0, j=0; i<_status.length; i++) {
      if( _status[i].solvedN != _status[j].solvedN || _status[i].totalPenalty != _status[j].totalPenalty )
        j = i;
      ranking.push(<Team rank={j+1} result={_status[i]} />)
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
      <td>{"team"+result.teamID}</td>,
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
  <Scoreboard settingsUrl="settings.json" statusUrl="status.json" />,
  document.getElementById('scoreboard')
)
