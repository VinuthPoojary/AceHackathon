# Digital Queue Management System

## Project Overview
The Digital Queue Management System is a modern web application designed to streamline patient flow and reduce waiting times in hospitals and clinics. By digitizing the queue process, this system aims to improve patient experience, optimize staff and resource management, and increase transparency in healthcare service delivery.

## Problem Statement
Healthcare facilities often face challenges such as:
- Long waiting times causing patient dissatisfaction
- Overcrowding and frustration in waiting areas
- Inefficient allocation and management of staff and resources
- Lack of transparency in patient flow and queue status

This system addresses these issues by providing a digital platform for queue management that benefits both patients and healthcare providers.

## Key Features
- **Real-time Queue Management:** Patients can join queues digitally and monitor their position in real-time.
- **Patient and Staff Portals:** Separate interfaces for patients to check queue status and for staff to manage queues efficiently.
- **Authentication:** Secure login for patients and staff to access their respective portals.
- **Department Selection:** Patients can select the department they need to visit, enabling better queue organization.
- **Analytics Dashboard:** Staff can view queue statistics and performance metrics to optimize operations.
- **Notifications:** Alerts and updates to patients about their queue status.
- **Responsive Design:** Accessible on various devices including desktops, tablets, and smartphones.

## Technologies Used
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Firebase (Authentication, Firestore)
- **State Management:** React Context API
- **Testing:** Playwright (for end-to-end testing)
- **UI Components:** Custom reusable components built with React and Tailwind CSS

## Installation and Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/VinuthPoojary/AceHackathon.git
   cd AceHackathon
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Firebase:
   - Set up a Firebase project.
   - Add your Firebase configuration in `src/lib/firebase.ts` or set up environment variables.
   
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000` to access the application.

## Usage
- Patients can register or log in to join queues and check their position.
- Staff can log in to manage queues, view analytics, and update patient statuses.
- Departments can be selected to organize queues by service type.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your improvements.

## License
This project is licensed under the MIT License.

---

For any questions or support, please contact the project maintainer.
