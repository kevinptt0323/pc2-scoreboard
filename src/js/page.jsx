var Header = React.createClass({
  render: function() {
    return (
      <div className="ui huge header">
        2015 ACM-ICPC Taiwan Online Programming Contest
      </div>
    );
  }
});

React.render(
  <Header />,
  document.getElementById('header')
)

