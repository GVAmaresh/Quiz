# Quiz Platform 

- Next.js + Node.js + MongoDB
Create and join quizzes with unique admin controls

## Key Features
- Dual Access Codes:

> public_id for participants
>
> public_id + private_id for admin management

- Admin Controls:
> Modify questions/answers, timers, and settings

- Auto-Expire:
> Quizzes expire after 24 days (configurable)

- Real-Time Updates:
> Live sync for admins and participants

- Responsive UI:
> Works on all devices

## Tech Stack

| **Frontend** | **Backend** | **Database** | 
| ------------ | ----------- | ------------ | 
| Next.js      | Node.js     | MongoDB      |
| Tailwind CSS | Express     | Mongoose     |           

## Quick Start
Clone repo:

```bash
git clone https://github.com/GVAmaresh/Quiz && cd Quiz
npm install
npm run dev
```
Visit http://localhost:3000

### Environment Variables (.env.local)
```env
MONGODB_URI="your_mongodb_connection_string"  
NEXTAUTH_SECRET="your_secret_here"
```

### Core Structure
```text
/  
├── client/         # Next.js frontend  
│   ├── app/      
│   └── public/ 
├── server/         # Node.js backend
│   ├── models/
│   ├── controllers/      
│   └── routes/
│   ├── config/
└── Readme/      
```
  
### Database Model (Quiz)
```javascript
{  
  public_id: String,   
  private_id: String,  
  questions: [{  
    questionText: String,  
    options: [String],  
    correctAnswer: Number, 
    timer: Number    
  }],  
  expiresAt: Date      
}
```
### Key API Endpoints

| **Endpoint**                              | **Method** | **Description**             |
| ----------------------------------------- | ---------- | --------------------------- |
| `/api/quizzes`                            | POST       | Create new quiz             |
| `/api/quizzes/:publicId`                  | GET        | Get quiz (participant view) |
| `/api/quizzes/admin/:privateId`           | PUT        | Update quiz settings        |
| `/api/quizzes/admin/:privateId/questions` | POST       | Add new question            |

### Change Quiz Duration
Modify default expiration in server/models/Quiz.js:

```javascript
expiresAt: {  
  type: Date,  
  default: () => Date.now() + 24*60*60*1000 // Change 24 → X days  
}
```

