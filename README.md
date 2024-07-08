# 3D Comparison Videos

An interactive web application for creating and visualizing 3D comparison videos.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

3D Comparison Videos is a web-based tool that allows users to create dynamic, three-dimensional visualizations of comparative data. It's designed to make data representation more engaging and interactive, perfect for presentations, educational content, or data analysis.

## Features

- Interactive 3D bar charts
- Customizable animations
- Video recording functionality
- CSV data import
- Custom image upload for bar textures
- Fullscreen mode
- Keyboard shortcuts for easy control

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository:
git clone https://github.com/lout33/bar_generations_3d_web.git


2. Navigate to the project directory:
cd bar_generations_3d_web


3. Install dependencies:
npm install



4. Start the development server:
npm run dev



5. Open your browser and visit `http://localhost:3000`

## Usage

1. **Default View**: Upon loading, you'll see a default set of comparison bars.

2. **Controls**:
- Start animation
- Play/Pause animation
- Decelerate/Accelerate animation
- Record animation
- Toggle fullscreen

3. **Adding Custom Data**:
- Prepare a CSV file with your data (see example in `/public/test1.csv`)
- Prepare images for each data point (names should match CSV entries)
- Upload your CSV and images using the provided interface
- Apply changes to view your custom visualization

4. **Keyboard Shortcuts**:
- `A`: Start animation
- `S`: Play/pause animation
- `D`: Decelerate animation
- `F`: Accelerate animation
- `G`: Start/stop recording

## Contributing

We welcome contributions to the 3D Comparison Videos project!

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

Project Link: [https://github.com/lout33/bar_generations_3d_web](https://github.com/lout33/bar_generations_3d_web)



