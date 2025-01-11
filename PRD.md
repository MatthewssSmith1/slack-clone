# Product Requirements Document

This Slack clone MVP aims to facilitate team communication through real-time messaging, channel-based discussions, and file sharing. This platform will include a user-friendly interface. It will exclude some advanced features like analytics and integrations with 3rd party services.

## User Roles & Core Workflows

1. Standard users can send/receive messages, create threads, DM eachother, join public channels, and upload files to facilitate team collaboration.
2. Admin users can manage channels and control user access.

## Technical Foundation

The application is built using a Laravel backend with Eloquent ORM and Breeze for auth, a React frontend (bridged by Laravel's Inertia), and a TursoDB-hosted libSQL database.

## Data Models

The `id` (primary key), `created_at`, and `updated_at` columns are assumed for all tables:

User - name, email, email_verified_at, password, profile_picture (url), last_active_at
ChannelUser - user_id, channel_id, role
Message - user_id, channel_id, parent_id, content, deleted_at
Channel - name, description, channel_type 
Reaction - user_id, message_id, emoji_code
<!-- TODO: Workspace - name, channel_id -->
<!-- TODO: File, Emoji -->

## Required Enum Types

- role: owner, admin, member
- channel_type: public, private, direct

## API Endpoints

### UserController

- `index`
- `show`
- `update`
- `POST /users/{user}/status`

### ChannelController

- `index`
- `create`
- `store`
- `show`
- `update`
- `destroy`

### ChannelUserController

- `POST /channels/{channel}/users` 
- `DELETE /channels/{channel}/users/{user}`

### MessageController

- `GET /channels/{channel}/messages`
- `POST /channels/{channel}/messages`
- `GET /users/{user}/messages`
- `POST /users/{user}/messages`

### FileController

<!-- TODO: File, Emoji -->
## Key Components

1. **ChatComponent**: Displays messages and facilitates message input
2. **Sidebar**: Provides navigation through UserList and ChannelList
3. **Header**: Manages user profile settings and status
4. **MessageInput**: Supports text entry and file uploads
5. **ChannelForm**: Enables channel creation and updates in the admin panel

## MVP Launch Requirements

1. Implement user authentication and authorization using Laravel Breeze
2. Develop real-time messaging capabilities with Laravel Echo and WebSockets
3. Enable channel creation, management, and user membership control by admins
4. Allow users to send, receive, and search messages and files within channels and direct chats
5. Establish role-based access control for admin-exclusive functionalities
