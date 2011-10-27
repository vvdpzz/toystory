class ApplicationController < ActionController::Base
  before_filter :authenticate_user!
  layout :route_layout
  protect_from_forgery
  
  private
    def route_layout
      devise_controller? ? "welcome" : "application"
    end
end
