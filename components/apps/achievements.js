import React, { Component } from 'react';
import AchievementsList from '../achievements/AchievementsList';
import AchievementDetails from '../achievements/AchievementDetails';

export class Achievements extends Component {
  constructor() {
    super();
    this.state = {
      currentView: 'list', // 'list' or 'details'
      selectedId: null,
      currentAchievement: null,
    };
  }

  handleSelect = (id) => {
    const achievement = this.props.achievements.find(a => a.id === id);
    if (achievement) {
      this.setState({
        currentView: 'details',
        selectedId: id,
        currentAchievement: achievement,
      });
    }
  };

  handleBack = () => {
    this.setState({
      currentView: 'list',
      selectedId: null,
      currentAchievement: null,
    });
  };

  render() {
    const { currentView, currentAchievement } = this.state;
    const { achievements } = this.props;

    if (!achievements) {
        return (
            <div className="h-full w-full bg-ub-cool-grey text-white flex items-center justify-center">
                <p>Loading achievements...</p>
            </div>
        );
    }

    return (
      <div className="h-full w-full bg-ub-cool-grey">
        {currentView === 'list' ? (
          <AchievementsList achievements={achievements} onSelect={this.handleSelect} />
        ) : (
          <AchievementDetails achievement={currentAchievement} onBack={this.handleBack} />
        )}
      </div>
    );
  }
}

export const displayAchievements = (props) => {
  return <Achievements {...props} />;
};
