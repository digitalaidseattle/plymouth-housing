/**
 *  UserContext.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { User } from "@supabase/supabase-js";
import { createContext } from "react";

interface UserContextType {
    user: User | null;
    setUser: (user: User) => void;
}

export const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => { }
});
