<div align="center">
  <img src="public/favicon.svg" alt="CPUSCHED Logo" width="120" />
  <h1>CPUSCHED</h1>
  <p><strong>Intelligent CPU Scheduling Simulator</strong></p>
  <p>A production-grade, highly interactive visualization tool for OS CPU Scheduling Algorithms.</p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  </p>
</div>

---

## 🚀 Overview

**CPUSCHED** is a feature-rich, interactive Single Page Application (SPA) designed to simulate and visualize various CPU scheduling algorithms. Built with modern web technologies, it provides a comprehensive educational tool for understanding process scheduling, complete with dynamic Gantt charts, real-time metrics generation, and an animated simulation playback feature.

It effectively bridges the gap between theoretical operating system concepts and practical visual learning.

## ✨ Features

- **Multiple Algorithms Supported:**
  - First-Come, First-Served (FCFS)
  - Shortest Job First (SJF) - Non-preemptive
  - Shortest Remaining Time First (SRTF) - Preemptive SJF
  - Round Robin (RR)
  - Priority Scheduling (Non-preemptive)
  - Preemptive Priority Scheduling

- **Dynamic Visualizations:**
  - **Animated Gantt Chart:** Visualizes CPU execution timeline dynamically.
  - **Live Playback:** Watch the scheduling happen in real-time with adjustable playback speed.
  - **Arrival Timeline:** Visual timeline mapping absolute process arrival times.

- **Advanced Metrics & Analytics:**
  - Automatically calculates **Average Waiting Time**, **Average Turnaround Time**, and **CPU Utilization**.
  - Detailed per-process breakdown table including Burst, Completion, Turnaround, Waiting, and Response times.
  - **Execution Log Feed:** Step-by-step contextual explanations of context switches and process states.

- **Comparison Mode:**
  - Run the same process dataset against multiple algorithms simultaneously to evaluate and compare efficiency metrics.

- **Built-in Educational Examples:**
  - Load predefined scenarios like *Convoy Effect*, *High Context Switching*, and *Starvation* to instantly see algorithms fail or succeed under specific conditions.

## 🛠 Tech Stack

*   **Frontend Framework:** React 18, Vite
*   **State Management:** Zustand (for complex global simulator state)
*   **Styling:** Vanilla CSS & Tailwind CSS (Custom Dark UI Theme)
*   **Icons:** Lucide React
*   **Typography:** Google Inter (UI) & JetBrains Mono (Execution Logs & Data)

## 💻 Getting Started

You will need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MohammadFayasKhan/cpuSched.git
   cd cpuSched
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:5173` to interact with the simulator.

## 🧠 Architectural Highlights

- **Abstract Algorithm Engine:** The absolute scheduling logic is abstracted away from the UI components. Each algorithm takes a pristine deep-copied array of process objects and outputs a standardized `timeline` array. 
- **Portal Tooltips:** Implemented `React.createPortal` for completely unclipped, fixed-position Gantt Chart contextual tooltips bypassing deep DOM hierarchy and overflow restraints.
- **Dynamic Flexbox Sizing:** The Gantt Chart rendering engine flawlessly maps relative execution block widths to the true mathematical timeline duration utilizing calculated percentage/flex units.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/MohammadFayasKhan/cpuSched/issues).

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
