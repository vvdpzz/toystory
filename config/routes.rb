Toystory::Application.routes.draw do

  root :to => 'contests#index'
  
  match 'pusher/auth' => "pusher#auth"
  
  devise_for :users
  resources :users
  resources :contests do
    collection do
      post "check_credits"
    end
  end
  
  resources :messages do
    collection do
      get "load_conversations"
      get "load_contact_list"
      get "messages"
      get "load_messages"
      post "remove_conversation"
      post "send_message"
      get "load_messages_on_navbar"
      post "update_last_viewed"
    end
  end

  resources :recharge do
    collection do
      post :notify
      get :done
      post :generate_order
    end
  end
  resources :profile, :only => [] do
    collection do
      post "follow_user"
      post "unfollow_user"
      post "follow_contest"
      post "unfollow_contest"
      post "update_username"
      post "update_description"
      post "update_location"
      post "update_introduction"
      post "update_website"
      get "load_users"
      get "load_contests"
    end
  end
  resources :autosave, :only => [] do
    collection do
      post "save_creation"
      post "discard_creation"
      post "save_entry"
      post "discard_entry"
    end
  end
end
