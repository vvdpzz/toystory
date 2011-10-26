Toystory::Application.routes.draw do
  root :to => 'contests#index'
  devise_for :users
  
  resources :contests do
    collection do
      post "check_credits"
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
