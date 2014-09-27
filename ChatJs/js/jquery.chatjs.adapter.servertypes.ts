class ChatMessageInfo {
    /// The user that sent the message
    UserFromId: number;

    /// The user to whom the message is to
    UserToId: number;

    /// The conversation to which the message is being sent
    ConversationId: number;

    /// The room to which the message is being sent
    RoomId: number;

    /// <summary>
    /// Message timestamp
    /// </summary>
    Timestamp: number;

    /// <summary>
    /// Message text
    /// </summary>
    Message: string;

    /// Client GUID
    ClientGuid: string

    /// Still verifying whether this is necessary
    DateTime: Date
}

enum UserStatusType {
    Offline = 0,
    Online = 1
}

/// <summary>
/// Information about a chat user
/// </summary>
class ChatUserInfo {
    /// User chat status. For now, it only supports online and offline
    constructor() {

    }

    /// User Id (preferebly the same as database user Id)
    Id: number;

    /// User display name
    Name: string;

    /// Profile Url
    Url: string

    /// User profile picture URL (Gravatar, for instance)
    ProfilePictureUrl: string

    /// User's status
    Status: UserStatusType;

    /// Last time this user has been active
    LastActiveOn: Date;

    /// User e-mail
    Email: string;

    /// User room id
    RoomId: number
}

class ChatRoomInfo {
    /// The room id
    Id: number

    /// The room display name
    Name: string

    /// Number of online users right now
    UsersOnline: number;
}

class ChatTypingSignalInfo {

    // room to send the typing signal to
    RoomId: number;

    // conversation to send the typing signal to
    ConversationId: number;

    // user to send the typing signal to
    UserToId: number;

    // user that originated the typing signal
    UserFrom: ChatUserInfo;
}

class ChatUserListChangedInfo {

    // room from which the users changed
    RoomId: number;

    // conversation from which the users changed
    ConversationId: number;

    // list of users
    UserList: Array<ChatUserInfo>;
}

class ChatRoomListChangedInfo {

    // room list
    Rooms: Array<ChatRoomInfo>;
}