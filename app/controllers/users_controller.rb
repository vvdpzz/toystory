class UsersController < ApplicationController
  def show
    if @user = User.find_by_id(params[:id])
      @profile = @user.profile
      @follower_users = $redis.scard("users:#{@user.id}.follower_users")
      @following_users = $redis.scard("users:#{@user.id}.following_users")
      @following_contests = $redis.scard("users:#{@user.id}.following_contests")
      @is_myself = (@user.id == current_user.id)
    else
      
    end
  end

end
