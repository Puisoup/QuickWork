# QuickWork PoC

QuickWork is a platform connecting users (Customers) with companies for home improvement jobs, vetted by Experts.

## Features

*   **Role-Based Access**:
    *   **Customer**: Create requests, view offers, chat with experts/companies, rate completed work.
    *   **Expert**: Review customer requests, chat to clarify details, create "Frameworks" (Gutachten) with budget/timeline estimates.
    *   **Company**: Browse verified requests, place bids/offers, manage active jobs, schedule execution dates.
    *   **Admin**: User management.
*   **Workflow**:
    1.  Customer creates a Request.
    2.  Expert reviews, chats, and creates a Framework.
    3.  Companies place Offers (Bids) based on the Framework.
    4.  Customer accepts an Offer.
    5.  Company executes work; Customer rates the service.
*   **Chat System**: Integrated two-way chat for Customer-Expert and Customer-Company.
*   **File Uploads**: Attachments support for Offers and Frameworks.

## Tech Stack

*   **Framework**: Next.js 16 (App Router)
*   **Database**: SQLite (via Prisma ORM)
*   **Styling**: Tailwind CSS
*   **Language**: TypeScript

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Database**:
    ```bash
    npx prisma db push
    # Optional: Seed data or create users manually via Register page
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000)

## Security Note

This is a Proof of Concept (PoC). Authentication is basic properly handled `cookies`.

## License

Private / Educational Purpose.
