var Header = React.createClass({
  render: function() {
    return (
      <div>
        2015 ACM-ICPC Taiwan Online Programming Contest
      </div>
    );
  }
});

React.render(
  <Header />,
  document.getElementById('header')
)

