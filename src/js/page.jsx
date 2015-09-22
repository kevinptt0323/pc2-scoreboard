var Header = React.createClass({
  render: function() {
    return (
      <div>
        {this.state._settings.contestName}
      </div>
    );
  },
  getInitialState: function() {
    return { _settings: [] };
  },
  componentDidMount: function() {
    this.loadSettings();
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

React.render(
  <Header settingsUrl="settings.json" />,
  document.getElementById('header')
)

