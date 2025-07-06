import { CiCamera } from "react-icons/ci";
import { Link } from "react-router-dom";

const Camera = () => {
  return (
    <div className="camera-button">
      <button>
        <Link to="/camera">
          <CiCamera />
        </Link>
      </button>
    </div>
  );
};
export default Camera;
