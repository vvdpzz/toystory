class UsersController < ApplicationController
  def show
    @user = User.find_by_id params[:id]
    if @user
    else
    end
  end

end
